'use client'

import { Card } from "./_components/card";
import { MqttProvider } from "./context/MqttContex";

export default function Home() {
  return (
    <MqttProvider>
      <main
        className=" 
          min-h-screen
          flex 
          justify-center 
          items-center 
          bg-primary-1
        "
      >
        <Card/>
      </main>
    </MqttProvider>
  );
}
