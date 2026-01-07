"use server"

export async function sendEmail(formData: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: "info@montestech.online",
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Erro ao enviar email")
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return { success: false, error: "Erro ao enviar email. Por favor, tente novamente." }
  }
}
