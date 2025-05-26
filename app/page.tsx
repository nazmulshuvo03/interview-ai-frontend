import AudioRecorder from "./components/AudioRecorder";
import AudioTest from "./components/AudioTest";
import ClientOnly from "./components/ClientOnly";
import VoiceChat from "./components/VoiceChat";
import TextToSpeech from "./components/TextToSpeech";
import GeminiChat from "./components/GeminiChat";
import InterviewStarter from "./components/InterviewStarter";

export default function Home() {
  return (
    <div>
      <h1>Hello</h1>
      <ClientOnly>
        {/* <AudioTest /> */}
        {/* <VoiceChat /> */}
        {/* <AudioRecorder /> */}
        {/* <TextToSpeech /> */}
        {/* <GeminiChat /> */}
        <InterviewStarter />
      </ClientOnly>
    </div>
  );
}
