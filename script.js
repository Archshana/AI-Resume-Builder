async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  // Get form values
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const summary = document.getElementById("summary").value;
  const education = document.getElementById("education").value;
  const skills = document.getElementById("skills").value;
  const experience = document.getElementById("experience").value;
  const linkedinName = document.getElementById("linkedinName").value;
  const linkedinUrl = document.getElementById("linkedinUrl").value;
  const referees = document.getElementById("referees").value;
  const certificateName = document.getElementById("certificateName").value;
  const certificateUrl = document.getElementById("certificateUrl").value;
  const projects = document.getElementById("projects").value;
  const languages = document.getElementById("languages").value;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const leftMargin = 20;
  const rightMargin = 20;

  // Two-column layout similar to many minimalist resumes
  const sidebarWidth = 60; // left column
  const mainWidth = pageWidth - leftMargin - rightMargin - sidebarWidth - 5; // right column

  const sidebarX = leftMargin;
  const mainX = sidebarX + sidebarWidth + 5;

  let headerY = 22;

  // Header: name on top-left, bold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(name || "Your Name", sidebarX, headerY);

  headerY += 7;

  // Role line (from first line of summary if exists)
  if (summary) {
    const firstLine = summary.split(/\n/)[0];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const roleLine = doc.splitTextToSize(firstLine, pageWidth - leftMargin - rightMargin);
    doc.text(roleLine[0], sidebarX, headerY);
    headerY += 6;
  }

  // Draw a bold horizontal line under header
  doc.setDrawColor(0);
  doc.setLineWidth(0.6);
  doc.line(leftMargin, headerY, pageWidth - rightMargin, headerY);

  let sidebarY = headerY + 8;
  let mainY = headerY + 8;

  // Helper to render a label:value pair in the sidebar
  const renderSidebarLine = (label, value) => {
    if (!value) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, sidebarX, sidebarY);
    sidebarY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const wrapped = doc.splitTextToSize(value, sidebarWidth - 4);
    wrapped.forEach(line => {
      doc.text(line, sidebarX, sidebarY);
      sidebarY += 4;
    });
    sidebarY += 3;
  };

  // Sidebar: contact info
  renderSidebarLine("EMAIL", email);
  renderSidebarLine("PHONE", phone);
  renderSidebarLine("ADDRESS", address);

  if (linkedinName && linkedinUrl) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("LINKEDIN", sidebarX, sidebarY);
    sidebarY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.textWithLink(linkedinName, sidebarX, sidebarY, { url: linkedinUrl });
    sidebarY += 7;
  } else if (linkedinName) {
    renderSidebarLine("LINKEDIN", linkedinName);
  }

  // Sidebar: Skills (split by comma into bullets)
  if (skills) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SKILLS", sidebarX, sidebarY);
    sidebarY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const skillItems = skills.split(",").map(s => s.trim()).filter(Boolean);
    skillItems.forEach(item => {
      const line = `• ${item}`;
      const wrapped = doc.splitTextToSize(line, sidebarWidth - 4);
      wrapped.forEach(w => {
        doc.text(w, sidebarX, sidebarY);
        sidebarY += 4;
      });
    });
    sidebarY += 4;
  }

  // Sidebar: Languages
  if (languages) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("LANGUAGES", sidebarX, sidebarY);
    sidebarY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const langLines = doc.splitTextToSize(languages, sidebarWidth - 4);
    langLines.forEach(line => {
      doc.text(line, sidebarX, sidebarY);
      sidebarY += 4;
    });
    sidebarY += 4;
  }

  // Draw vertical divider between sidebar and main content
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(mainX - 3, headerY + 2, mainX - 3, pageHeight - 20);

  // Helper to render a section in main column
  const renderMainSection = (title, body) => {
    if (!body) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), mainX, mainY);
    mainY += 5;

    doc.setDrawColor(0);
    doc.setLineWidth(0.25);
    doc.line(mainX, mainY, mainX + mainWidth, mainY);
    mainY += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wrapped = doc.splitTextToSize(body, mainWidth);
    const lineHeight = 4.5;
    wrapped.forEach(line => {
      if (mainY > pageHeight - 20) {
        doc.addPage();
        mainY = 20;
      }
      doc.text(line, mainX, mainY);
      mainY += lineHeight;
    });
    mainY += 5;
  };

  // Main sections in typical order
  renderMainSection("Professional Summary", summary);
  renderMainSection("Experience", experience);
  renderMainSection("Education", education);
  if (projects) {
    renderMainSection("Projects", projects);
  }

  // Certificates (text + images) in main column
  if (certificateName || certificateUrl) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("CERTIFICATES", mainX, mainY);
    mainY += 5;
    doc.setDrawColor(0);
    doc.setLineWidth(0.25);
    doc.line(mainX, mainY, mainX + mainWidth, mainY);
    mainY += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (certificateName) {
      const certTitle = `Certificate image: ${certificateName}`;
      const wrappedTitle = doc.splitTextToSize(certTitle, mainWidth);
      wrappedTitle.forEach(line => {
        if (mainY > pageHeight - 20) {
          doc.addPage();
          mainY = 20;
        }
        doc.text(line, mainX, mainY);
        mainY += 4.5;
      });
      mainY += 3;
    }

    if (certificateUrl) {
      const urls = certificateUrl
        .split(/[\n,]/)
        .map(u => u.trim())
        .filter(u => u.length > 0);

      for (const url of urls) {
        if (/\.(png|jpe?g|gif)$/i.test(url)) {
          try {
            const dataUrl = await loadImageAsDataUrl(url);
            const imgWidth = Math.min(80, mainWidth);
            const imgHeight = 45;

            if (mainY + imgHeight + 10 > pageHeight - 20) {
              doc.addPage();
              mainY = 20;
            }

            doc.addImage(dataUrl, "PNG", mainX, mainY, imgWidth, imgHeight);
            mainY += imgHeight + 6;
          } catch (e) {
            // ignore bad image
          }
        }
      }
    }

    mainY += 4;
  }

  // Referees in main column
  if (referees) {
    renderMainSection("Referees (non-related)", referees);
  }

  // Download PDF
  doc.save("Resume.pdf");
}

// Helper: load image URL as data URL for embedding into PDF
function loadImageAsDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
