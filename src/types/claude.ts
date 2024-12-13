// Base message types
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

// Content block types
export interface ContentBlock {
  type: 'text' | 'image' | 'code';
  text?: string;
}

// Artifact specific types
export interface ArtifactBlock extends ContentBlock {
  type: 'artifact';
  id: string;
  metadata: {
    artifact_type: 'code' | 'image' | 'text';
    file_name?: string;
    language?: string;
    mime_type?: string;
  };
}

// Streaming response types
export type ClaudeStreamEvent = 
  | ContentBlockStart 
  | ContentBlockDelta 
  | ContentBlockStop 
  | MessageStop;

export interface ContentBlockStart {
  type: 'content_block_start';
  content_block: {
    type: 'text' | 'artifact';
    id: string;
    metadata?: {
      artifact_type?: string;
      file_name?: string;
      language?: string;
    };
  };
}

export interface ContentBlockDelta {
  type: 'content_block_delta';
  delta: {
    type: 'text_delta';
    text: string;
  };
}

export interface ContentBlockStop {
  type: 'content_block_stop';
  content_block: {
    type: 'text' | 'artifact';
    id: string;
  };
}

export interface MessageStop {
  type: 'message_stop';
}

// Our application types
export interface StreamedArtifact {
  type: 'code' | 'text' | 'image';
  id: string;
  content: string;
  metadata: {
    fileName?: string;
    language?: string;
    mimeType?: string;
  };
}

export interface StreamedResponse {
  type: 'text' | 'artifact';
  content: string;
  artifact?: StreamedArtifact;
} 