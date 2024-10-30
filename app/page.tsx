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
          text-sm  /* Default font size for smallest screens */
          sm:text-base  /* Font size for screens ≥640px */
          md:text-lg  /* Font size for screens ≥768px */
          lg:text-xl  /* Font size for screens ≥1024px */
        "
      >
        <Card/>
      </main>
    </MqttProvider>
  );
}
