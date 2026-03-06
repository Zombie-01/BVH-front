import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-6">Last updated: March 7, 2026</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p>
          Welcome to our mobile application ("App"). This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you use our App. We are committed to protecting your privacy and
          ensuring the security of your personal data.
        </p>
        <p>
          By using our App, you agree to the collection and use of information
          in accordance with this policy. If you do not agree with our policies
          and practices, please do not use our App.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          2. Information We Collect
        </h2>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc list-inside ml-4">
          <li>
            <strong>Personal Information:</strong> Name, email address, phone
            number, and other details you provide during registration or profile
            setup.
          </li>
          <li>
            <strong>Location Data:</strong> Precise and approximate location
            information to provide location-based services, such as finding
            nearby stores or services.
          </li>
          <li>
            <strong>Device Information:</strong> Device type, operating system,
            unique device identifiers, and app usage data.
          </li>
          <li>
            <strong>Media Files:</strong> Photos, videos, or audio recordings
            you upload or create within the app.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you interact with
            the app, including pages viewed, features used, and time spent.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          3. How We Use Your Information
        </h2>
        <p>We use the collected information for the following purposes:</p>
        <ul className="list-disc list-inside ml-4">
          <li>To provide and maintain our services.</li>
          <li>To personalize your experience and improve the app.</li>
          <li>
            To communicate with you about updates, promotions, or support.
          </li>
          <li>To process transactions and manage orders.</li>
          <li>To ensure security and prevent fraud.</li>
          <li>To comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          4. Permissions and Their Use
        </h2>
        <p>
          Our app requests certain permissions to function properly. Below is a
          detailed explanation of each permission and why it is needed:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>
            <strong>
              Location (ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION):
            </strong>{" "}
            Used to provide location-based services, such as finding nearby
            stores, services, or delivery options. This helps us offer relevant
            recommendations and improve your user experience.
          </li>
          <li>
            <strong>Camera:</strong> Allows you to capture and upload photos or
            videos related to products, orders, or profiles. This permission is
            optional and only accessed when you choose to use camera features.
          </li>
          <li>
            <strong>
              Storage (WRITE_EXTERNAL_STORAGE and READ_EXTERNAL_STORAGE):
            </strong>{" "}
            Enables saving and retrieving files, such as images or documents,
            to/from your device's storage. This is used for offline access to
            uploaded content and app functionality.
          </li>
          <li>
            <strong>
              Microphone (RECORD_AUDIO and MODIFY_AUDIO_SETTINGS):
            </strong>{" "}
            Permits recording audio for features like voice notes, customer
            support calls, or audio feedback. This permission is only used when
            you initiate audio-related actions.
          </li>
          <li>
            <strong>
              Internet and Network State (INTERNET and ACCESS_NETWORK_STATE):
            </strong>{" "}
            Required to connect to our servers, sync data, and provide online
            services. Without this, the app cannot function as intended.
          </li>
        </ul>
        <p>
          You can manage these permissions in your device settings at any time.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          5. Data Sharing and Disclosure
        </h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information
          to third parties without your consent, except as described below:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>
            <strong>Service Providers:</strong> We may share data with trusted
            third-party service providers who assist us in operating our app,
            such as Supabase for data storage and hosting.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose information if
            required by law or to protect our rights and safety.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger,
            acquisition, or sale of assets, your data may be transferred.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized access, alteration,
          disclosure, or destruction. However, no method of transmission over
          the internet is 100% secure.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
        <p>You have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Access, update, or delete your personal information.</li>
          <li>Withdraw consent for data processing where applicable.</li>
          <li>Object to or restrict certain types of data processing.</li>
          <li>Data portability.</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information
          provided below.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
        <p>
          Our app is not intended for children under 13. We do not knowingly
          collect personal information from children under 13. If we become
          aware that we have collected such information, we will take steps to
          delete it.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          9. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the "Last updated" date.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <p>Email: [Your Email Address]</p>
        <p>Phone: [Your Phone Number]</p>
        <p>Address: [Your Business Address]</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
