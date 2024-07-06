"use client"

import { useState } from "react";
import AmbientSynth from "@/components/AmbientSynth";
import CompoundInterestCalculator from "@/components/CompoundInterestCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeProvider } from "next-themes";
import DrumMachine from "@/components/DrumMachine";

const theme = window.matchMedia('(prefers-color-scheme: dark)').matches === true ? 'dark' : 'light';

export default function Home() {

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem
      disableTransitionOnChange
    >
      <main className="flex min-h-screen w-full mx-auto flex-col items-center justify-between p-24">
        <Tabs defaultValue="compoundInterestCalculator" className="flex w-full mx-auto flex-col">
          <TabsList className="w-full max-w-3xl mx-auto">
            <TabsTrigger value="compoundInterestCalculator">複利計算</TabsTrigger>
            <TabsTrigger value="ambientSynth">アンビエントシンセサイザー</TabsTrigger>
            <TabsTrigger value="drumMachine">ドラムマシン</TabsTrigger>
          </TabsList>
          <TabsContent value="compoundInterestCalculator" className="w-full max-w-3xl mx-auto">
            <CompoundInterestCalculator />
          </TabsContent>
          <TabsContent value="ambientSynth" className="w-full max-w-3xl mx-auto">
            <AmbientSynth />
          </TabsContent>
          <TabsContent value="drumMachine" className="w-full max-w-3xl mx-auto">
            <DrumMachine />
          </TabsContent>
        </Tabs>
      </main>
    </ThemeProvider>

  );
}
