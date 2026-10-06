import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. IMPORTAMOS THE HOOK DE REDIRECCIÓN
import logo from '../../../public/img/Logotipo2.jpeg';
import classImg from '../../../public/img/Class.png';
import oasisHotelImg from '../../../public/img/oasisHotel.png';


function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate(); // 2. INICIALIZAMOS EL NAVEGADOR INTERNO

	const handleSubmit = async (e) => {
		e.preventDefault();

		setLoading(true);
		setError('');

		try {
			await login(username, password);
			// 3. CAMBIO CLAVE: Navegamos internamente sin recargar la app ni perder el contexto
			navigate('/');
		} catch (err) {
			setError('Usuario o contraseña incorrectos');
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				background: 'linear-gradient(135deg, #000000 50%, #000000 100%)',
				padding: '20px',
			}}
		>
			<div
				style={{
					background: 'black',
					padding: '30px',
					borderRadius: '10px',
					width: '100%',
					maxWidth: '450px',
					boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
				}}
			>
				{/* LOGO */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '25px',
					}}
				>
					<img
						src={logo}
						alt="Logo Intimax"
						style={{
							width: '100%',
							maxWidth: '320px',
							height: 'auto',
							objectFit: 'contain',
							display: 'block',
						}}
					/>
				</div>

				{/* FORMULARIO */}
				<form onSubmit={handleSubmit}>
					{/* USUARIO */}
					<div style={{ marginBottom: '15px' }}>
						<label
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '7px',
								marginBottom: '5px',
								color: '#C8A46A',
								fontSize: '16px',
								fontWeight: 'bold',
							}}
						>
							<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B11226" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="8" r="4" />
								<path d="M5 21a7 7 0 0 1 14 0" />
							</svg>
							<span>Usuario</span>
						</label>

						<input
							data-cy="username"
							type="text"
							placeholder="Ingrese su usuario"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							autoFocus
							style={{
								width: '100%',
								padding: '14px',
								border: '1px solid #444',
								borderRadius: '6px',
								fontSize: '15px',
								fontWeight: 'bold',
								boxSizing: 'border-box',
								background: '#D4B26F',
								color: '#000000',
								outline: 'none',
							}}
						/>
					</div>

					{/* CONTRASEÑA */}
					<div style={{ marginBottom: '25px' }}>
						<label
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '7px',
								marginBottom: '5px',
								color: '#C8A46A',
								fontSize: '16px',
								fontWeight: 'bold',
							}}
						>
							<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B11226" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
								<rect x="4" y="11" width="16" height="11" rx="2" />
								<path d="M8 11V7a4 4 0 1 1 8 0v4" />
							</svg>
							<span>Contraseña</span>
						</label>

						<div style={{ position: 'relative' }}>
							<input
								data-cy="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Ingrese su contraseña"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								style={{
									width: '100%',
									padding: '14px 48px 14px 14px',
									border: '1px solid #444',
									borderRadius: '6px',
									fontSize: '15px',
									fontWeight: 'bold',
									boxSizing: 'border-box',
									background: '#D4B26F',
									color: '#000000',
									outline: 'none',
								}}
							/>
							<button
								type="button"
								aria-label="Mostrar contraseña"
								title="Mostrar contraseña"
								onPointerDown={() => setShowPassword(true)}
								onPointerUp={() => setShowPassword(false)}
								onPointerLeave={() => setShowPassword(false)}
								onPointerCancel={() => setShowPassword(false)}
								onKeyDown={(event) => {
									if (event.key === ' ' || event.key === 'Enter') {
										event.preventDefault();
										setShowPassword(true);
									}
								}}
								onKeyUp={(event) => {
									if (event.key === ' ' || event.key === 'Enter') {
										setShowPassword(false);
									}
								}}
								onBlur={() => setShowPassword(false)}
								style={{
									position: 'absolute',
									top: '50%',
									right: '12px',
									transform: 'translateY(-50%)',
									display: 'grid',
									placeItems: 'center',
									width: '32px',
									height: '32px',
									padding: '4px',
									border: 'none',
									background: 'transparent',
									color: '#111',
									cursor: 'pointer',
								}}
							>
								<svg
									aria-hidden="true"
									width="19"
									height="19"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
									{showPassword ? (
										<path d="m3 3 18 18" />
									) : (
										<circle cx="12" cy="12" r="3" />
									)}
								</svg>
							</button>
						</div>
					</div>

					{/* BOTÓN */}
					<button
						data-cy="login-button"
						type="submit"
						disabled={loading}
						style={{
							width: '100%',
							padding: '14px',
							background: loading ? '#666' : '#B11226',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							fontSize: '17px',
							fontWeight: 'bold',
							cursor: loading ? 'not-allowed' : 'pointer',
							transition: '0.3s',
						}}
					>
						{loading ? 'Ingresando...' : 'INGRESAR'}
					</button>

					{/* ERROR */}
					{error && (
						<p
							role="alert"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '8px',
								flexWrap: 'wrap',
								color: '#B11226',
								fontWeight: 700,
								fontSize: '15px',
								marginTop: '15px',
							}}
						>
							<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B11226" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" />
								<path d="M12 8v4" />
								<circle cx="12" cy="16" r="0.5" fill="#B11226" />
							</svg>
							{error}
						</p>
					)}
				</form>

				{/* NUESTROS CLIENTES - CAROUSEL */}
				<div
					style={{
						marginTop: '50px',
						paddingTop: '20px',
						borderTop: '1px solid #333',
						textAlign: 'center',
						fontSize: '14px',
						color: '#fff',
					}}
				>
					<h3 style={{ color: '#C8A46A', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>Nuestros Clientes</h3>

					{/* Carousel container */}
					<ClientCarousel />
				</div>
			</div>
		</div>
	);
}

export default Login;

function ClientCarousel() {
	const clientImages = [
		classImg,
		oasisHotelImg,
	];
	const slides = [clientImages[clientImages.length - 1], ...clientImages, clientImages[0]];

	const [current, setCurrent] = useState(1);
	const [transitionEnabled, setTransitionEnabled] = useState(true);
	const transitionLock = useRef(false);

	const moveBy = (direction) => {
		if (transitionLock.current) return;

		transitionLock.current = true;
		setCurrent((index) => index + direction);
	};

	useEffect(() => {
		const id = setInterval(() => {
			moveBy(1);
		}, 5000);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		if (transitionEnabled) return undefined;

		const frame = requestAnimationFrame(() => {
			setTransitionEnabled(true);
			transitionLock.current = false;
		});
		return () => cancelAnimationFrame(frame);
	}, [transitionEnabled]);

	const handleTransitionEnd = (event) => {
		if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;

		if (current === 0 || current === slides.length - 1) {
			setTransitionEnabled(false);
			setCurrent(current === 0 ? clientImages.length : 1);
		} else {
			transitionLock.current = false;
		}
	};

	const prev = () => moveBy(-1);
	const next = () => moveBy(1);
	const arrowButtonStyle = {
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		display: 'grid',
		placeItems: 'center',
		width: '28px',
		height: '28px',
		padding: 0,
		border: '2px solid #B11226',
		borderRadius: '50%',
		background: 'rgba(0, 0, 0, 0.72)',
		color: '#B11226',
		cursor: 'pointer',
		zIndex: 1,
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			<div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
				<div style={{ overflow: 'hidden', borderRadius: 8, background: 'transparent', padding: 12 }}>
					<div
						style={{
							display: 'flex',
							width: `${slides.length * 100}%`,
							transform: `translateX(-${current * (100 / slides.length)}%)`,
							transition: transitionEnabled ? 'transform 0.8s ease' : 'none',
						}}
						onTransitionEnd={handleTransitionEnd}
					>
						{slides.map((src, index) => (
							<div key={index} style={{ flex: `0 0 ${100 / slides.length}%`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
								<img loading="lazy" src={src} alt={`Cliente ${(index - 1 + clientImages.length) % clientImages.length + 1}`} style={{ maxWidth: '230px', maxHeight: '100px', objectFit: 'contain' }} />
							</div>
						))}
					</div>
				</div>

				<button type="button" onClick={prev} aria-label="Cliente anterior" style={{ ...arrowButtonStyle, left: -35 }}>
					<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
				<button type="button" onClick={next} aria-label="Cliente siguiente" style={{ ...arrowButtonStyle, right: -35 }}>
					<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
			</div>
		</div>
	);
}