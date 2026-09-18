<?php

namespace App\Models\Traits;

trait RecordsAuthEvents
{
    /**
     * Record a successful sign-in for this user.
     */
    public function logSignedIn(): void
    {
        activity('auth')
            ->performedOn($this)
            ->log("Pengguna {$this->name} ({$this->email}) berhasil masuk.");
    }

    /**
     * Record a sign-out for this user.
     */
    public function logSignedOut(): void
    {
        activity('auth')
            ->performedOn($this)
            ->log("Pengguna {$this->name} ({$this->email}) keluar.");
    }

    /**
     * Record a failed sign-in attempt targeting this user's email.
     */
    public function logFailedSignIn(): void
    {
        activity('auth')
            ->performedOn($this)
            ->log("Percobaan masuk gagal untuk akun {$this->email}.");
    }
}
