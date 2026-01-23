import { vi } from "vitest";

/**
 * Mock MediaRecorder for testing speech-to-text and audio recording
 */
export class MockMediaRecorder {
  state = "inactive";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  mimeType = "audio/webm";

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(["audio"], { type: "audio/webm" }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
}

/**
 * Mock MediaStream for testing media device access
 */
export class MockMediaStream {
  private tracks: Array<{ stop: () => void }> = [{ stop: vi.fn() }];

  getTracks() {
    return this.tracks;
  }
}

/**
 * Sets up all media-related mocks (MediaRecorder, MediaStream, URL, navigator.mediaDevices)
 * Returns a cleanup function to restore original implementations
 */
export function setupMediaMocks() {
  const originalMediaRecorder = globalThis.MediaRecorder;
  const originalMediaDevices = navigator.mediaDevices;
  const originalCreateObjectURL = globalThis.URL.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

  // Mock URL methods
  globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  globalThis.URL.revokeObjectURL = vi.fn();

  // Mock MediaRecorder
  globalThis.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

  // Mock navigator.mediaDevices
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
    },
    configurable: true,
  });

  // Return cleanup function
  return () => {
    globalThis.MediaRecorder = originalMediaRecorder;
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    Object.defineProperty(navigator, "mediaDevices", {
      value: originalMediaDevices,
      configurable: true,
    });
  };
}
