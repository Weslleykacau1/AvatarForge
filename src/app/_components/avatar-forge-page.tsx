"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Save, Trash2, Plus, Loader, Clapperboard, Edit, User, Shirt, Sparkles, Film, Wand2, FileImage } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGallery } from "@/hooks/use-gallery";
import { generateVideoAction, generateTitleAction, generateActionAction } from "@/app/actions";
import type { Influencer } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const influencerSchema = z.object({
  name: z.string().min(1, "Título da Cena é obrigatório.").max(100, "Título muito longo."),
  scenarioPrompt: z.string().min(1, "Descrição do cenário é obrigatória.").max(1000, "Descrição muito longa."),
  actionPrompt: z.string().min(1, "Ação principal é obrigatória.").max(1000, "Descrição muito longa."),
  sceneImage: z.string().optional(),
});

type InfluencerFormData = z.infer<typeof influencerSchema>;

export default function AvatarForgePage() {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { gallery, addOrUpdateInfluencer, removeInfluencer, isLoaded } = useGallery();
  const [isPending, startTransition] = useTransition();
  const [isGeneratingTitle, startTitleTransition] = useTransition();
  const [isGeneratingAction, startActionTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InfluencerFormData>({
    resolver: zodResolver(influencerSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      scenarioPrompt: "",
      actionPrompt: "",
      sceneImage: "",
    },
  });

  const onGenerateSubmit = form.handleSubmit((data) => {
    setVideoUrl(null);
    startTransition(async () => {
      const result = await generateVideoAction({
        sceneTitle: data.name,
        scenarioPrompt: data.scenarioPrompt,
        actionPrompt: data.actionPrompt,
        sceneImageDataUri: data.sceneImage,
      });
      if (result.success && result.videoDataUri) {
        setVideoUrl(result.videoDataUri);
        toast({
          title: "Vídeo Gerado!",
          description: "Seu vídeo de avatar está pronto.",
        });
      } else if (result.error) {
        toast({
          variant: "destructive",
          title: "Falha na Geração",
          description: result.error,
        });
      }
    });
  });

  const handleGenerateTitle = () => {
    const scenario = form.getValues("scenarioPrompt");
    const action = form.getValues("actionPrompt");
    if (!scenario || !action) {
      toast({
        variant: "destructive",
        title: "Faltando contexto",
        description: "Por favor, preencha o cenário e a ação principal para gerar um título.",
      });
      return;
    }
    startTitleTransition(async () => {
      const result = await generateTitleAction({ context: `Cenário: ${scenario}, Ação: ${action}` });
      if (result.success && result.title) {
        form.setValue("name", result.title, { shouldValidate: true });
        toast({ title: "Título Gerado!" });
      } else {
        toast({ variant: "destructive", title: "Falha ao gerar título", description: result.error });
      }
    });
  };

  const handleGenerateAction = () => {
    const scenario = form.getValues("scenarioPrompt");
    if (!scenario) {
      toast({
        variant: "destructive",
        title: "Faltando contexto",
        description: "Por favor, preencha o cenário para gerar uma ação.",
      });
      return;
    }
    startActionTransition(async () => {
      const result = await generateActionAction({ context: `Cenário: ${scenario}` });
      if (result.success && result.action) {
        form.setValue("actionPrompt", result.action, { shouldValidate: true });
        toast({ title: "Ação Gerada!" });
      } else {
        toast({ variant: "destructive", title: "Falha ao gerar ação", description: result.error });
      }
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("sceneImage", reader.result as string, { shouldValidate: true });
        toast({ title: "Imagem Carregada" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToGallery = (data: InfluencerFormData) => {
    const id = currentId || crypto.randomUUID();
    addOrUpdateInfluencer({ id, ...data });
    if (!currentId) setCurrentId(id);
    toast({
      title: "Salvo na Galeria",
      description: `Cena "${data.name}" foi salva.`,
    });
  };

  const handleLoadInfluencer = (influencer: Influencer) => {
    form.reset(influencer);
    setCurrentId(influencer.id);
    setVideoUrl(null);
    toast({
      title: "Cena Carregada",
      description: `Carregado "${influencer.name}" no editor.`,
    });
  };

  const handleNewInfluencer = () => {
    form.reset({ name: "", scenarioPrompt: "", actionPrompt: "", sceneImage: "" });
    setCurrentId(null);
    setVideoUrl(null);
  };

  const handleDeleteInfluencer = (id: string, name: string) => {
    removeInfluencer(id);
    if (currentId === id) {
      handleNewInfluencer();
    }
    toast({
      title: "Cena Deletada",
      description: `"${name}" foi removido da sua galeria.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clapperboard className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold font-headline text-primary-foreground">AvatarForge</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-2 flex flex-col gap-8">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                  <Film className="text-accent" />
                  2. Crie ou Edite uma Cena
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={onGenerateSubmit} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Cena</FormLabel>
                        <FormControl><Input placeholder="Ex: Unboxing do Produto X" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateTitle} disabled={isGeneratingTitle}>
                      {isGeneratingTitle ? <Loader className="animate-spin mr-2" /> : <Wand2 />} Gerar Título com IA
                    </Button>

                    <FormField control={form.control} name="sceneImage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência de Cenário (Opcional)</FormLabel>
                        <FormControl>
                          <>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                              <FileImage className="mr-2" />
                              Escolher ficheiro
                            </Button>
                          </>
                        </FormControl>
                        {field.value && <p className="text-sm text-muted-foreground">Imagem selecionada.</p>}
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="scenarioPrompt" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cenário</FormLabel>
                        <FormControl><Textarea placeholder="Descreva o ambiente em detalhes - iluminação, cores, objetos, atmosfera..." {...field} rows={5} /></FormControl>
                        <p className="text-xs text-muted-foreground">Dica: Seja específico sobre iluminação, cores dominantes, materiais, e atmosfera. Quanto mais detalhes, melhor o resultado.</p>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="actionPrompt" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ação Principal</FormLabel>
                        <FormControl><Textarea placeholder="O que o influenciador está a fazer..." {...field} rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateAction} disabled={isGeneratingAction}>
                      {isGeneratingAction ? <Loader className="animate-spin mr-2" /> : <Wand2 />} Gerar Ação com IA
                    </Button>

                    <div className="flex flex-wrap gap-2 pt-4">
                      <Button type="submit" disabled={isPending || !form.formState.isValid} className="flex-grow">
                        {isPending ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <Bot className="mr-2 h-4 w-4" />}
                        {isPending ? "Gerando..." : "Gerar Vídeo"}
                      </Button>
                      <Button type="button" variant="secondary" onClick={form.handleSubmit(handleSaveToGallery)} className="flex-grow">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar na Galeria
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-headline text-xl">
                  <span className="flex items-center gap-2">Minha Galeria</span>
                  <Button variant="ghost" size="sm" onClick={handleNewInfluencer}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Cena
                  </Button>
                </CardTitle>
                <CardDescription>Carregue ou delete suas cenas salvas.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60 pr-4">
                  <div className="space-y-3">
                    {!isLoaded && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
                    {isLoaded && gallery.length === 0 && (
                      <div className="text-center text-muted-foreground py-10">
                        <p>Sua galeria está vazia.</p>
                      </div>
                    )}
                    {isLoaded && gallery.map((influencer) => (
                      <div key={influencer.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 transition-colors">
                        <span className="font-medium truncate pr-2">{influencer.name}</span>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handleLoadInfluencer(influencer)}>Carregar</Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteInfluencer(influencer.id, influencer.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="sticky top-24 bg-card/80">
              <CardHeader>
                <CardTitle className="font-headline">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-lg bg-black flex items-center justify-center overflow-hidden">
                  {isPending ? (
                    <div className="text-center space-y-4 text-muted-foreground p-4">
                      <Loader className="h-12 w-12 animate-spin mx-auto text-accent" />
                      <p className="font-headline text-lg">Gerando seu avatar...</p>
                      <p className="text-sm">Isso pode levar até um minuto. Por favor, aguarde.</p>
                    </div>
                  ) : videoUrl ? (
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-4 text-muted-foreground p-4">
                      <Clapperboard className="h-16 w-16 mx-auto" />
                      <p className="font-headline text-lg">Seu vídeo aparecerá aqui</p>
                      <p className="text-sm">Preencha os campos e clique em "Gerar Vídeo".</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
