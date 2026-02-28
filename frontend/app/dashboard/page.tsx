"use client"

import { useState, useRef } from "react"
import axios from "axios"
import exifr from "exifr"

export default function Dashboard() {

  const [cameraOn, setCameraOn] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [descriptionType, setDescriptionType] = useState<"TEXT" | "VOICE">("TEXT")
  const [text, setText] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [coordinates, setCoordinates] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 📍 Get Location
  const getLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported")
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude

      try {
        const geoRes = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: { lat, lon, format: "json" }
          }
        )

        setCoordinates({
          latitude: lat,
          longitude: lon,
          address: geoRes.data.display_name
        })

      } catch (err) {
        console.error("Address fetch failed:", err)
        setCoordinates({
          latitude: lat,
          longitude: lon,
          address: "Location detected"
        })
      }
    },
    (error) => {
      console.error("Location error:", error)
      alert("Please allow location access")
    }
  )
}

  // 📷 Start Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })

      setStream(mediaStream)
      setCameraOn(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
        }
      }, 200)

    } catch (err) {
      console.error("Camera error:", err)
    }
  }

  // 📸 Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current) return

    const video = videoRef.current

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx?.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], "captured.jpg", {
        type: "image/jpeg"
      })

      handleImage(file)

      stream?.getTracks().forEach(track => track.stop())
      setCameraOn(false)

    }, "image/jpeg")
  }

  // 📷 Handle Image Upload
  const handleImage = async (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))

    const exif = await exifr.parse(file)
    console.log("EXIF:", exif)

    getLocation()
  }

  // 🎤 Start Recording
  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const recorder = new MediaRecorder(audioStream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)

        audioStream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
      }

      recorder.start()
      setIsRecording(true)

    } catch (err) {
      console.error("Mic error:", err)
    }
  }

  // ⏹ Stop Recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  // 🚀 Submit
  const handleSubmit = async () => {
    if (!image || !coordinates) {
      alert("Image and location required!")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("image", image)
    formData.append("description_type", descriptionType)
    formData.append("text", text)
    formData.append("latitude", coordinates.latitude)
    formData.append("longitude", coordinates.longitude)

    if (audioBlob) {
      formData.append("audio", audioBlob)
    }

    await axios.post("http://localhost:5000/api/reports/submit", formData)

    setLoading(false)
    alert("Report Submitted Successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center p-6">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          KleanUrban Citizen Dashboard
        </h1>

        {/* Image Section */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Capture or Upload Image (Required)
          </label>

          <div className="flex gap-4 mb-3">
            <button
              onClick={startCamera}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              📷 Open Camera
            </button>

            <label className="bg-gray-300 px-4 py-2 rounded cursor-pointer">
              📤 Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files) handleImage(e.target.files[0])
                }}
              />
            </label>
          </div>

          {cameraOn && (
            <div className="mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-lg border shadow"
              />
              <button
                onClick={capturePhoto}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              >
                📸 Capture
              </button>
            </div>
          )}

          {preview && (
            <img
              src={preview}
              className="mt-4 rounded-lg border shadow"
            />
          )}
        </div>

        {coordinates && (
          <div className="bg-green-100 p-3 rounded mb-6 text-sm">
            📍 {coordinates.address}
          </div>
        )}

        {/* Description Section */}
        <div className="mb-4">
          <div className="flex gap-4 mb-3">
            <button
              onClick={() => setDescriptionType("TEXT")}
              className={`px-4 py-2 rounded ${
                descriptionType === "TEXT"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Type Text
            </button>

            <button
              onClick={() => setDescriptionType("VOICE")}
              className={`px-4 py-2 rounded ${
                descriptionType === "VOICE"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Record Voice
            </button>
          </div>

          {descriptionType === "TEXT" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border w-full p-3 rounded"
            />
          )}

          {descriptionType === "VOICE" && (
            <div>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  🎤 Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  ⏹ Stop Recording
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!image || !coordinates || loading}
          className={`w-full py-3 rounded text-white font-semibold ${
            !image || !coordinates
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>

      </div>
    </div>
  )
}