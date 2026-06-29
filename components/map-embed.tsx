export function MapEmbed() {
  return (
    <div className="rounded-lg overflow-hidden border-2 border-background/20 shadow-lg">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115149.45099869823!2d32.51686567910156!3d-25.965269999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69b2f4e0ff32d%3A0x5b1e8db45516f4d5!2sMaputo%2C%20Mo%C3%A7ambique!5e0!3m2!1spt-PT!2spt!4v1234567890123!5m2!1spt-PT!2spt"
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Localização Montes Tech em Maputo"
      />
    </div>
  )
}
