<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactFormSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public array $contact;

    public function __construct(array $contact)
    {
        $this->contact = $contact;
    }

    public function build()
    {
        return $this->subject('New Contact Form Submission: ' . $this->contact['subject'])
            ->replyTo($this->contact['email'], $this->contact['name'])
            ->view('emails.contact_form_submitted')
            ->with(['contact' => $this->contact]);
    }
}
