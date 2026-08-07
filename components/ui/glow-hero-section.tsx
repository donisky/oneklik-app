"use client";

import React, { useEffect, useRef } from 'react';
import { Dna, Network, Leaf, Menu } from 'lucide-react';

export default function FuturisticHero() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contentWrapperRef = useRef<HTMLDivElement | null>(null);
    const mousePos = useRef<{ x: number | undefined; y: number | undefined }>({ x: undefined, y: undefined });
    const frame = useRef<number>(0);

    // Effect for the "Aqueous Mesh" background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const points: Point[] = [];
        const gridSize = 30;

        class Point {
            x: number;
            y: number;
            originX: number;
            originY: number;
            z: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.originX = x;
                this.originY = y;
                this.z = 0;
            }

            update() {
                if (mousePos.current.x === undefined || mousePos.current.y === undefined) {
                    this.x += (this.originX - this.x) * 0.1;
                    this.y += (this.originY - this.y) * 0.1;
                    this.z += (0 - this.z) * 0.1;
                    return;
                }

                const dx = this.x - mousePos.current.x;
                const dy = this.y - mousePos.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 150;

                if (dist < maxDist) {
                    const angle = Math.atan2(dy, dx);
                    const force = (maxDist - dist) / maxDist;
                    this.x += Math.cos(angle) * force * 5;
                    this.y += Math.sin(angle) * force * 5;
                    this.z = force * 20;
                }

                // Return to origin
                this.x += (this.originX - this.x) * 0.1;
                this.y += (this.originY - this.y) * 0.1;
                this.z += (0 - this.z) * 0.1;
            }
        }

        const init = () => {
            points.length = 0;
            const cols = Math.ceil(canvas.width / gridSize);
            const rows = Math.ceil(canvas.height / gridSize);
            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    points.push(new Point(i * gridSize, j * gridSize));
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame.current++;

            const cols = Math.ceil(canvas.width / gridSize);
            const rows = Math.ceil(canvas.height / gridSize);

            points.forEach(p => p.update());

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "rgba(255, 122, 0, 0.4)");
            gradient.addColorStop(1, "rgba(50, 205, 50, 0.4)");
            ctx.strokeStyle = gradient;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const p1 = points[i * (rows + 1) + j];
                    const p2 = points[i * (rows + 1) + (j + 1)];
                    const p3 = points[(i + 1) * (rows + 1) + j];

                    if (p1 && p2) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineWidth = 1 + p1.z / 10;
                        ctx.stroke();
                    }
                    if (p1 && p3) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p3.x, p3.y);
                        ctx.lineWidth = 1 + p1.z / 10;
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseOut = () => {
            mousePos.current = { x: undefined, y: undefined };
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Effect for handling the content parallax
    useEffect(() => {
        const contentWrapper = contentWrapperRef.current;
        if (!contentWrapper) return;
        
        const handleMouseMoveForParallax = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth) - 0.5;
            const y = (clientY / window.innerHeight) - 0.5;
            const parallaxFactor = 20;
            contentWrapper.style.transform = `translate3d(${-x * parallaxFactor}px, ${-y * parallaxFactor}px, 0) perspective(1000px)`;
        };
        
        window.addEventListener('mousemove', handleMouseMoveForParallax);
        return () => {
            window.removeEventListener('mousemove', handleMouseMoveForParallax);
        };
    }, []);

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-50">
            {/* Canvas Background */}
            <canvas id="aqueous-canvas" ref={canvasRef} className="absolute inset-0 z-0"></canvas>
            
            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col min-h-screen" ref={contentWrapperRef}>
                <header className="py-6 px-4">
                    <nav className="flex justify-between items-center">
                        <a href="#" className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-500 drop-shadow-sm">
                            GAIA
                        </a>
                        <div className="hidden md:flex items-center space-x-8 text-sm font-bold">
                            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Ecosystems</a>
                            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Research</a>
                            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Symbiosis</a>
                            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Seed</a>
                        </div>
                        <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all hidden md:block">
                            Access Nursery
                        </button>
                        <button className="md:hidden text-gray-700">
                            <Menu className="w-6 h-6" />
                        </button>
                    </nav>
                </header>
                
                <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600 drop-shadow-sm">
                            The Gaia Protocol
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
                            A decentralized framework for global environmental synthesis, powered by a living, self-organizing data network.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg shadow-green-500/30 hover:opacity-90 hover:-translate-y-0.5 transition-all">
                                Begin Cultivation &rarr;
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all">
                                View Genesis Block
                            </button>
                        </div>
                    </div>

                    <div className="w-full mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature Card 1 */}
                        <div className="p-8 rounded-3xl text-left bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
                                    <Dna className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Bioform Compiler</h3>
                            </div>
                            <p className="mt-4 text-sm text-gray-600 leading-relaxed font-medium">
                                Translate complex ecological data into executable, adaptive digital organisms.
                            </p>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="p-8 rounded-3xl text-left bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                                    <Network className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Mycelium Network</h3>
                            </div>
                            <p className="mt-4 text-sm text-gray-600 leading-relaxed font-medium">
                                A resilient, distributed mesh network that mimics fungal intelligence for data routing.
                            </p>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="p-8 rounded-3xl text-left bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                                    <Leaf className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Photosynth Chain</h3>
                            </div>
                            <p className="mt-4 text-sm text-gray-600 leading-relaxed font-medium">
                                A novel blockchain that generates energy and value from verified carbon sequestration.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}