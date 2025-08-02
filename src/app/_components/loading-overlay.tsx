
"use client";

import { Wand2 } from "lucide-react";

const loadingTips = [
    "Dica: Descrições detalhadas de aparência geram avatares mais consistentes.",
    "Dica: Use um 'Prompt Negativo' para evitar elementos indesejados no vídeo.",
    "Dica: Para melhores resultados, especifique a iluminação e a atmosfera do cenário.",
    "Dica: Experimente diferentes ângulos de câmera para vídeos mais dinâmicos.",
    "Dica: Salve seus avatares e produtos favoritos para reutilizá-los facilmente.",
    "Dica: A geração de vídeo pode levar até um minuto. Que tal um café enquanto espera?",
];

export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6 text-center text-white p-4">
        <Wand2 className="animate-pulse text-accent h-16 w-16" />
        <h2 className="text-2xl font-bold font-headline">A mágica está a acontecer...</h2>
        <p className="text-lg text-muted-foreground">O seu vídeo está a ser gerado. Isto pode demorar até um minuto.</p>
        <p className="text-sm text-muted-foreground mt-8 italic">{randomTip}</p>
      </div>
    </div>
  );
}
