class UserAgentManager {
  static #userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (X11; Linux x86_64)',
    'ModelContextProtocol/1.1 (Advanced Fetch Agent)'
  ];

  static selectRandomUserAgent() {
    const index = Math.floor(Math.random() * this.#userAgents.length);
    return this.#userAgents[index];
  }
}