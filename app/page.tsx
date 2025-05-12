import AudioRecorder from "./components/AudioRecorder";
import AudioTest from "./components/AudioTest";
import ClientOnly from "./components/ClientOnly";
import VoiceChat from "./components/VoiceChat";
import TextToSpeech from "./components/TextToSpeech";

export default function Home() {
  return (
    <div>
      <h1>Hello</h1>
      <ClientOnly>
        <AudioTest />
        <VoiceChat />
        <AudioRecorder />
        <TextToSpeech />
      </ClientOnly>
    </div>
  );
}
