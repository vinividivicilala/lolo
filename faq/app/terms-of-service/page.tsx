'use client';

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const getMaxScroll = () => {
      return content.scrollWidth - window.innerWidth;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxScroll = getMaxScroll();
      let newScrollLeft = scrollLeft + e.deltaY;
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      gsap.to(container, {
        x: -scrollLeft,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX - (container.getBoundingClientRect().left + scrollLeft);
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.getBoundingClientRect().left;
      const walk = (x - startX) * 1.5;
      let newScrollLeft = scrollLeft - walk;
      const maxScroll = getMaxScroll();
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      gsap.to(container, {
        x: -scrollLeft,
        duration: 0,
        ease: "none",
      });
    };

    const handleMouseUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.style.cursor = "grab";

    return () => {
      window.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#000000",
        fontFamily: "Helvetica, Arial, sans-serif",
        position: "relative",
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          willChange: "transform",
        }}
      >
        <div
          ref={contentRef}
          style={{
            display: "flex",
            gap: "100px",
            alignItems: "center",
            padding: "0 100px",
          }}
        >
          {/* Teks TERMS OF SERVICES yang besar */}
          <div
            style={{
              fontWeight: "700",
              fontSize: "700px",
              lineHeight: "1",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            TERMS OF SERVICES
          </div>

          {/* Section 1 - Introduction */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              1. Introduction, Acceptance and General Conditions
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Welcome to our services. These Terms of Service ("Terms") govern your access to and use of our website, applications, and other products and services (collectively, the "Services"). Please read these Terms carefully before using our Services.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              By accessing or using any of our Services, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any part of these Terms, you may not access or use our Services. These Terms constitute a legally binding agreement between you ("you", "your", or "user") and the company ("we", "us", "our", or "company").
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              We reserve the right to update, change, or replace any part of these Terms at our sole discretion. It is your responsibility to check this page periodically for changes. Your continued use of or access to the Services following the posting of any changes constitutes acceptance of those changes.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              These Terms apply to all users of the Services, including without limitation users who are browsers, vendors, customers, merchants, and contributors of content.
            </p>
          </div>

          {/* Section 2 - Use of Services */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              2. Use of Services
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              You agree to use our Services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              When using our Services, you agree not to:
            </p>
            <ul style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
              paddingLeft: "2rem",
            }}>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Use the Services for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Services</li>
              <li>Interfere with or disrupt the integrity or performance of the Services</li>
              <li>Transmit any viruses, malware, or other harmful code</li>
              <li>Harass, abuse, insult, harm, defame, or discriminate against others</li>
              <li>Upload or transmit any false, misleading, or deceptive information</li>
              <li>Collect or track personal information of others without their consent</li>
            </ul>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              We reserve the right to terminate your use of the Services for violating any of these prohibited uses.
            </p>
          </div>

          {/* Section 3 - Intellectual Property */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              3. Intellectual Property Rights
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              All content, features, and functionality of our Services, including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, software, and the overall design and layout (collectively, the "Content"), are owned by the company, our licensors, or other providers and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the Content without our express prior written permission, except as expressly permitted by these Terms.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              The company name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of the company. You may not use such marks without our prior written permission.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Any unauthorized use of the Content may violate copyright laws, trademark laws, privacy laws, and other applicable regulations, and could result in legal action.
            </p>
          </div>

          {/* Section 4 - User Content */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              4. User Content and Submissions
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Our Services may allow you to post, upload, submit, or otherwise make available content such as comments, reviews, feedback, images, or other materials ("User Content"). You retain ownership of any intellectual property rights that you hold in your User Content.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              By posting User Content, you grant us a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content throughout the world in any media. You also grant us the right to use your name in connection with your User Content.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to post your User Content and to grant the rights granted herein. You agree not to post any User Content that is unlawful, defamatory, obscene, invasive of privacy, or otherwise objectionable.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              We reserve the right, but have no obligation, to monitor, edit, or remove any User Content at our sole discretion.
            </p>
          </div>

          {/* Section 5 - Privacy and Data Protection */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              5. Privacy and Data Protection
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms by reference, explains how we collect, use, and protect your personal information. By using our Services, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              You are responsible for maintaining the security of your account credentials and for any activities that occur under your account. Please notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </div>

          {/* Section 6 - Third-Party Links */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              6. Third-Party Links and Services
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Our Services may contain links to third-party websites, applications, or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party services.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              By using our Services, you expressly release us from any and all liability arising from your use of any third-party website or service. We encourage you to read the terms and conditions and privacy policies of any third-party services that you visit.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Your interactions with third parties found through our Services are solely between you and the third party. We shall not be responsible or liable for any loss or damage of any sort incurred as the result of any such dealings.
            </p>
          </div>

          {/* Section 7 - Limitation of Liability */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              7. Limitation of Liability
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              To the fullest extent permitted by applicable law, in no event shall the company, its affiliates, directors, employees, agents, or licensors be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses, arising out of or relating to your use of or inability to use the Services.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Our total liability to you for all claims arising out of or relating to these Terms or the Services shall not exceed the amount you paid us, if any, for using our Services during the twelve (12) months preceding the event giving rise to the claim.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you. In such jurisdictions, our liability shall be limited to the fullest extent permitted by law.
            </p>
          </div>

          {/* Section 8 - Disclaimer of Warranties */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              8. Disclaimer of Warranties
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK. THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              We do not warrant that the Services will be uninterrupted, timely, secure, or error-free, that defects will be corrected, or that the Services or the servers that make them available are free of viruses or other harmful components.
            </p>
          </div>

          {/* Section 9 - Indemnification */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              9. Indemnification
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              You agree to defend, indemnify, and hold harmless the company, its affiliates, directors, employees, agents, and licensors from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from:
            </p>
            <ul style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
              paddingLeft: "2rem",
            }}>
              <li>Your use of and access to the Services</li>
              <li>Your violation of any provision of these Terms</li>
              <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
              <li>Any claim that your User Content caused damage to a third party</li>
            </ul>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              This indemnification obligation will survive these Terms and your use of the Services.
            </p>
          </div>

          {/* Section 10 - Termination */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              10. Termination
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Upon termination, your right to use the Services will immediately cease. If you wish to terminate your account, you may simply discontinue using the Services or contact us to request account deletion.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              All provisions of these Terms which by their nature should survive termination shall survive termination, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </div>

          {/* Section 11 - Governing Law */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              11. Governing Law and Dispute Resolution
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is established, without regard to its conflict of law provisions.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}">
              Any dispute arising out of or relating to these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of a recognized arbitration association. The arbitration shall take place in the company's jurisdiction, and the language of arbitration shall be English.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              You agree that any claim against us must be filed within one (1) year after the cause of action arises, or such claim shall be permanently barred.
            </p>
          </div>

          {/* Section 12 - Miscellaneous */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              12. Miscellaneous Provisions
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and the company regarding your use of the Services, superseding any prior agreements.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not be considered a waiver of those rights.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              <strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              <strong>Assignment:</strong> You may not assign or transfer these Terms, by operation of law or otherwise, without our prior written consent. We may assign these Terms without restriction.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              <strong>Contact:</strong> For any questions or concerns regarding these Terms, please contact us at legal@company.com or at our physical address listed on our website.
            </p>
          </div>

          {/* Section 13 - Contact Information */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              13. Contact Information
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              If you have any questions, concerns, or complaints about these Terms or our Services, please contact us using the following information:
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "0.5rem",
            }}>
              <strong>Email:</strong> legal@company.com
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "0.5rem",
            }}>
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              <strong>Address:</strong> 123 Business Avenue, Suite 100, New York, NY 10001, United States
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
