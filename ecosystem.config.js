module.exports = {
  apps: [
    {
      name: "coachflow-ai",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: "/usr/coachflow-ai",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      max_memory_restart: "500M",
      autorestart: true,
    },
  ],
}
