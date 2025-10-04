export const islandContent = {
  About: {
    title: 'About Me',
    content: `
      <p>Hey! I'm Lionel Lapidos, a creative developer who loves pushing the boundaries of what's possible on the web.</p>
      <p>I specialize in creating immersive digital experiences that blend cutting-edge technology with thoughtful design. From interactive 3D worlds to experimental web features, I'm always exploring new ways to tell stories through code.</p>
      <div class="skills">
        <span class="skill-tag">JavaScript</span>
        <span class="skill-tag">Three.js</span>
        <span class="skill-tag">WebGL</span>
        <span class="skill-tag">React</span>
        <span class="skill-tag">Node.js</span>
        <span class="skill-tag">GSAP</span>
        <span class="skill-tag">Creative Coding</span>
      </div>
    `
  },
  Projects: {
    title: 'Projects',
    content: `
      <p>A collection of experimental and production work that showcases my approach to creative development.</p>
      <div class="project-list">
        <div class="project-item">
          <h3>🎮 Underwater Combat Game</h3>
          <p>An HTML5 canvas game featuring parallax scrolling, enemy AI, and particle effects.</p>
        </div>
        <div class="project-item">
          <h3>🌐 3D Portfolio Journey</h3>
          <p>This site! A Three.js-powered portfolio with floating islands and shader effects.</p>
        </div>
        <div class="project-item">
          <h3>✨ More Coming Soon</h3>
          <p>Currently working on WebGL experiments and generative art projects.</p>
        </div>
      </div>
      <style>
        .project-item {
          background: rgba(139, 157, 195, 0.1);
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          border: 1px solid rgba(139, 157, 195, 0.2);
        }
        .project-item h3 {
          color: #8b9dc3;
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
        }
        .project-item p {
          margin: 0;
          font-size: 0.95rem;
        }
      </style>
    `
  },
  Experience: {
    title: 'Experience',
    content: `
      <p>I bring ideas to life through code, collaborating with teams and clients to create memorable digital experiences.</p>
      <div class="experience-list">
        <div class="exp-item">
          <h3>Creative Developer</h3>
          <p class="exp-period">Current</p>
          <p>Specializing in interactive web experiences, 3D visualizations, and experimental interfaces.</p>
        </div>
        <div class="exp-item">
          <h3>Full Stack Developer</h3>
          <p class="exp-period">Previous</p>
          <p>Building scalable web applications with modern frameworks and cloud technologies.</p>
        </div>
      </div>
      <style>
        .exp-item {
          background: rgba(139, 157, 195, 0.1);
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          border: 1px solid rgba(139, 157, 195, 0.2);
        }
        .exp-item h3 {
          color: #8b9dc3;
          margin: 0;
          font-size: 1.3rem;
        }
        .exp-period {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          margin: 0.25rem 0 0.75rem 0;
          font-style: italic;
        }
        .exp-item > p:last-child {
          margin: 0;
          font-size: 0.95rem;
        }
      </style>
    `
  },
  Playground: {
    title: 'Playground',
    content: `
      <p>🎨 Experimental features and hidden surprises!</p>
      <p>This is where I test new ideas and push boundaries. Try some of these:</p>
      <div class="playground-features">
        <div class="feature">
          <h3>🎹 Konami Code</h3>
          <p>Try entering: ↑ ↑ ↓ ↓ ← → ← → B A</p>
        </div>
        <div class="feature">
          <h3>🎮 Mini Game</h3>
          <p>Check out the <a href="game/index.html" target="_blank" style="color: #8b9dc3;">underwater combat game</a>!</p>
        </div>
        <div class="feature">
          <h3>🔮 More to Come</h3>
          <p>This space is constantly evolving with new experiments.</p>
        </div>
      </div>
      <style>
        .feature {
          background: rgba(139, 157, 195, 0.1);
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          border: 1px solid rgba(139, 157, 195, 0.2);
        }
        .feature h3 {
          color: #8b9dc3;
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
        }
        .feature p {
          margin: 0;
          font-size: 0.95rem;
        }
      </style>
    `
  }
};
