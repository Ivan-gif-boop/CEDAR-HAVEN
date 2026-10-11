# Cedar Haven Deployment Checklist

## Static site launch checklist

- [ ] Confirm the final production domain is chosen (for example, Netlify custom domain, GitHub Pages, Vercel, or a managed static host).
- [ ] Ensure all HTML files load correctly without a backend server.
- [ ] Verify the favicon and browser metadata appear correctly in a production build.
- [ ] Confirm all external links open correctly and use the right target behavior.
- [ ] Validate WhatsApp and Booking.com links are live and use the correct phone number.
- [ ] Check the website on mobile portrait and landscape sizes at widths 320px, 375px, 390px, 768px, and 1024px.
- [ ] Ensure no horizontal overflow is present on small screens.
- [ ] Confirm navigation drawer opens and closes cleanly on touch devices.
- [ ] Test the gallery lightbox, review form, and contact interactions on mobile.
- [ ] Review image loading performance and replace any oversized media if needed.
- [ ] Set up HTTPS with the hosting provider and enable secure redirects if applicable.
- [ ] Confirm the site works with JavaScript enabled and has a graceful fallback for static content.
- [ ] Keep the final site in version control and make a release tag before launch.
- [ ] Run a final browser pass after deployment to confirm the live URL matches the expected branding and content.

## Recommended production notes

- This site is a static front-end experience, so no backend or database is required for the current business flow.
- It is ideal for a marketing presence, lead generation, and direct reservation prompts via WhatsApp and booking channels.
- For future growth, consider adding a real booking form or CRM workflow later if the business needs automated enquiry capture.
