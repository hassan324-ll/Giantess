<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #edf5ff; font-family: Arial, Helvetica, sans-serif; color: #1b2435;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #edf5ff; margin: 0; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 680px; overflow: hidden; border-radius: 18px; background-color: #ffffff; box-shadow: 0 18px 44px rgba(20, 71, 167, 0.10);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e63da 0%, #1fb4d9 100%); padding: 28px 32px;">
                            <p style="margin: 0 0 8px; color: #dff7ff; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">GIANTESS Contact</p>
                            <h1 style="margin: 0; color: #ffffff; font-size: 26px; line-height: 1.25; font-weight: 800;">New Contact Form Submission</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px 32px 12px;">
                            <p style="margin: 0 0 18px; color: #526174; font-size: 15px; line-height: 1.7;">
                                A customer submitted a new inquiry from the website contact form.
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; border: 1px solid #d9e7fb; border-radius: 12px; overflow: hidden;">
                                <tr>
                                    <td style="width: 34%; background-color: #f6faff; border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1447a7; font-size: 13px; font-weight: 700;">Name</td>
                                    <td style="border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1b2435; font-size: 14px;">{{ $contact['name'] }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 34%; background-color: #f6faff; border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1447a7; font-size: 13px; font-weight: 700;">Email</td>
                                    <td style="border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1b2435; font-size: 14px;">
                                        <a href="mailto:{{ $contact['email'] }}" style="color: #1e63da; text-decoration: none;">{{ $contact['email'] }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 34%; background-color: #f6faff; border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1447a7; font-size: 13px; font-weight: 700;">Phone</td>
                                    <td style="border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1b2435; font-size: 14px;">{{ $contact['phone'] ?? 'Not provided' }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 34%; background-color: #f6faff; border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1447a7; font-size: 13px; font-weight: 700;">Subject</td>
                                    <td style="border-bottom: 1px solid #d9e7fb; padding: 14px 16px; color: #1b2435; font-size: 14px;">{{ $contact['subject'] }}</td>
                                </tr>
                                <tr>
                                    <td style="width: 34%; background-color: #f6faff; padding: 14px 16px; color: #1447a7; font-size: 13px; font-weight: 700;">Privacy Accepted</td>
                                    <td style="padding: 14px 16px; color: #1b2435; font-size: 14px;">{{ $contact['privacyAccepted'] ? 'Yes' : 'No' }}</td>
                                </tr>
                            </table>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 22px; border-collapse: collapse; border: 1px solid #d9e7fb; border-radius: 12px; overflow: hidden;">
                                <tr>
                                    <td style="background-color: #f6faff; padding: 14px 16px; color: #1447a7; font-size: 13px; font-weight: 700;">Message</td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px; color: #1b2435; font-size: 14px; line-height: 1.8;">{!! nl2br(e($contact['message'])) !!}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 18px 32px 30px;">
                            <p style="margin: 0; color: #7a8798; font-size: 12px; line-height: 1.6;">
                                This notification was sent from the GIANTESS website contact form.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
