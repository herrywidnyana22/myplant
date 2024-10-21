'use client'

import { Card } from "./_components/card";
import { MqttProvider } from "./context/MqttContex";

export default function Home() {
  return (
    <MqttProvider>
      <main
        className=" 
          flex 
          justify-center 
          items-center 
          min-h-[100vh] 
          bg-primary-1
        "
      >
        <Card/>
      </main>
    </MqttProvider>
  );
}
