interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({
  onTranscript,
}: VoiceRecorderProps) {
  return <button>Record</button>;
}
