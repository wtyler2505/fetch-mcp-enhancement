class FetchErrorHandler {
  static async handleFetchError(error, url, retryCount = 3) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      url,
      errorMessage: error.message,
      retryCount
    };

    console.error('Fetch Error:', JSON.stringify(errorLog, null, 2));

    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retryCount)));
      return null; // Signal for retry
    }

    return {
      error: true,
      message: `Failed to fetch ${url} after multiple attempts`,
      details: errorLog
    };
  }
}