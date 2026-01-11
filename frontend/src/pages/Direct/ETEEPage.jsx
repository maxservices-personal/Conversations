import React from "react";

// End-to-End Encryption explanation for users (non-technical)
// Designed for a WhatsApp clone — friendly and reassuring tone.

export default function E2EEUserPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4 text-center">Your Chats Are Secure 🔒</h1>

      <p className="mb-6 text-lg text-center">
        Every message you send in this app is protected with <strong>end-to-end encryption</strong>. This means only you
        and the person you’re chatting with can read what’s sent — not even our servers can see your messages.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🔐 What Does End-to-End Encryption Mean?</h2>
        <p>
          End-to-end encryption (E2EE) keeps your messages private from the moment you tap “Send” until they reach your
          friend’s phone. Messages are locked (encrypted) on your device and can only be unlocked (decrypted) by your
          friend’s device. Even we can’t read them while they’re being delivered through our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🧠 How It Works (Simplified)</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li><strong>Your key, their key:</strong> Each user has a unique digital key that helps lock and unlock messages.</li>
          <li><strong>Sending a message:</strong> When you send a message, your app uses your friend’s public key to lock it so that only they can unlock it.</li>
          <li><strong>Server’s role:</strong> Our servers simply deliver the locked message — they can’t read or change it.</li>
          <li><strong>Receiving a message:</strong> Your friend’s phone uses their private key to unlock (decrypt) the message.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🧩 Why It’s Important</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>No one — not hackers, not even us — can see your private messages.</li>
          <li>Your photos, voice notes, and videos are encrypted before they leave your device.</li>
          <li>If someone intercepts your data, all they’ll see is scrambled code.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">💬 What About Group Chats?</h2>
        <p>
          Group chats are also end-to-end encrypted! Each participant has their own encryption keys. When you send a
          message, it’s safely encrypted so that only group members’ devices can unlock it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">🔍 Verify Your Chat’s Security</h2>
        <p>
          You can check your chat’s security by comparing security codes (or scanning QR codes) with your contact. This
          helps make sure no one is secretly intercepting your messages.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">❤️ Our Promise</h2>
        <p>
          Your privacy matters. We built this app so that your personal conversations stay <strong>personal</strong>.
          Your data is yours — always.
        </p>
      </section>

      <footer className="border-t pt-4 text-center text-sm text-gray-500">
        <p>End-to-end encryption is automatically enabled for all chats. You don’t need to turn it on manually.</p>
      </footer>
    </div>
  );
}