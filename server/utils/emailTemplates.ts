interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export const emailTemplates = {
    /**
     * Welcome email sent when user subscribes
     */
    subscriptionConfirmation: (unsubscribeUrl: string): EmailTemplate => ({
        subject: "Welcome to borysbabas.dev! 🎉",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #eeeeee;
      padding: 40px 20px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #93c5fd 0%, #fecaca 100%);
      padding: 40px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 40px 24px;
      background-color: #ffffff;
    }
    .content h2 {
      font-size: 22px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .content p {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 16px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #93c5fd 0%, #fecaca 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>🎉 Welcome!</h1>
    </div>
    <div class="content">
      <h2>Thanks for subscribing!</h2>
      <p>
        Hey there! 👋
      </p>
      <p>
        I'm excited to have you on board. You'll now receive updates whenever I publish new blog posts, projects, or share something interesting.
      </p>
      <p>
        Here's what you can expect:
      </p>
      <ul style="margin-left: 20px; margin-bottom: 16px; color: #4b5563;">
        <li>New blog post notifications</li>
        <li>Project updates and launches</li>
        <li>Insights on web development and design</li>
      </ul>
      <p>
        No spam, no nonsense. Just quality content delivered straight to your inbox.
      </p>
      <a href="https://borysbabas.dev" class="button">
        Visit My Website
      </a>
    </div>
    <div class="footer">
      <p>
        Don't want to receive these emails anymore?
      </p>
      <p>
        <a href="${unsubscribeUrl}">Unsubscribe</a>
      </p>
      <p style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} borysbabas.dev. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
        text: `
Welcome to borysbabas.dev! 🎉

Thanks for subscribing!

Hey there! 👋

I'm excited to have you on board. You'll now receive updates whenever I publish new blog posts, projects, or share something interesting.

Here's what you can expect:
- New blog post notifications
- Project updates and launches
- Insights on web development and design

No spam, no nonsense. Just quality content delivered straight to your inbox.

Visit my website: https://borysbabas.dev

---

Don't want to receive these emails anymore?
Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} borysbabas.dev. All rights reserved.
    `.trim(),
    }),

    /**
     * Email sent when a new blog post is published
     */
    newBlogPost: (
        post: {
            title: string;
            description: string;
            slug: string;
        },
        unsubscribeUrl: string,
    ): EmailTemplate => ({
        subject: `New Post: ${post.title}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #eeeeee;
      padding: 40px 20px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #93c5fd 0%, #fecaca 100%);
      padding: 40px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 8px;
    }
    .content {
      padding: 40px 24px;
      background-color: #ffffff;
    }
    .content h2 {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .content p {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 16px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #93c5fd 0%, #fecaca 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>📝 New Blog Post</h1>
      <p>Fresh content from borysbabas.dev</p>
    </div>
    <div class="content">
      <h2>${post.title}</h2>
      <p>${post.description}</p>
      <p>
        I just published a new blog post that I think you'll find interesting. Click the button below to read it!
      </p>
      <a href="https://borysbabas.dev/blog/${post.slug}" class="button">
        Read the Full Post
      </a>
    </div>
    <div class="footer">
      <p>
        Thanks for being a subscriber! ❤️
      </p>
      <p>
        <a href="https://borysbabas.dev">Visit Website</a> • 
        <a href="${unsubscribeUrl}">Unsubscribe</a>
      </p>
      <p style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} borysbabas.dev. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
        text: `
New Blog Post from borysbabas.dev 📝

${post.title}

${post.description}

I just published a new blog post that I think you'll find interesting.

Read the full post: https://borysbabas.dev/blog/${post.slug}

---

Thanks for being a subscriber! ❤️

Visit Website: https://borysbabas.dev
Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} borysbabas.dev. All rights reserved.
    `.trim(),
    }),

    /**
     * Unsubscribe confirmation email
     */
    unsubscribeConfirmation: (): EmailTemplate => ({
        subject: "You've been unsubscribed",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #eeeeee;
      padding: 40px 20px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 40px 24px;
      background-color: #ffffff;
      text-align: center;
    }
    .content h2 {
      font-size: 22px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .content p {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 16px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="content">
      <h2>You've been unsubscribed</h2>
      <p>
        You won't receive any more emails from borysbabas.dev.
      </p>
      <p>
        Sorry to see you go! If you change your mind, you can always subscribe again on my website.
      </p>
    </div>
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} borysbabas.dev. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
        text: `
You've been unsubscribed
          
You won't receive any more emails from borysbabas.dev.
          
Sorry to see you go! If you change your mind, you can always subscribe again on my website.
          
© ${new Date().getFullYear()} borysbabas.dev. All rights reserved.
    `.trim(),
    }),
};
