# Background Image Setup

Place your background image here named `landing-bg.jpg`.

- Path: `/public/landing-bg.jpg`
- This will be the full-screen background image for the landing page only
- Recommended: High resolution image (1920x1080 or larger)
- The image will be displayed at 20% opacity behind the text content
- Current image path in code: `url("/landing-bg.jpg")`

If your image has a different name, update the path in:
`app/page.tsx` line 9: `backgroundImage: 'url("/your-image-name.jpg")'`