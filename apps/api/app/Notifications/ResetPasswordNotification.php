<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * The password reset token.
     */
    public string $token;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:5176'), '/');
        $url = "{$frontendUrl}/reset-password?token={$this->token}&email={$notifiable->email}";

        return (new MailMessage)
            ->subject(Lang::get('Notifikasi Atur Ulang Sandi'))
            ->greeting(Lang::get('Halo, ').$notifiable->name)
            ->line(Lang::get('Anda menerima email ini karena kami menerima permintaan atur ulang sandi untuk akun Anda.'))
            ->action(Lang::get('Atur Ulang Sandi'), $url)
            ->line(Lang::get('Tautan ini akan kedaluwarsa dalam :count menit.', ['count' => config('auth.passwords.users.expire')]))
            ->line(Lang::get('Jika Anda tidak meminta atur ulang sandi, abaikan email ini.'));
    }
}
