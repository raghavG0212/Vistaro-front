export default function HeadingComponent({ children, heading, ...props }) {
	return (
		<>
      <div className="heading-wrapper" {...props}>
        <div className="heading-line" />
        <h1 className="heading-title">{children || heading}</h1>
        <div className="heading-line" />
			</div>

			{/* ADVANCED CSS */}
			<style>
				{`
          .heading-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 18px 12px;
            margin: 28px 0;
            cursor: default;
            animation: fadeIn 0.8s ease-out;
          }

          .heading-title {
            font-size: clamp(22px, 4vw, 38px);
            font-weight: 700;
            font-family: 'Merriweather', serif;
            text-transform: uppercase;
            letter-spacing: 2px;
            white-space: nowrap;
            color: #ffffff;
            text-shadow: 0 0 12px rgba(255, 255, 255, 0.35);
            animation: scaleIn 0.6s ease-out;
          }

          .heading-line {
            flex-grow: 1;
            height: 3px;
            border-radius: 12px;

            /* Beautiful Neon Gradient */
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.85) 50%,
              rgba(255, 255, 255, 0) 100%
            );

            /* Soft Glow */
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.45);
          }

          /* Fade-in Animation */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Title Pop Animation */
          @keyframes scaleIn {
            0% { transform: scale(0.7); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
			</style>
		</>
	);
}
