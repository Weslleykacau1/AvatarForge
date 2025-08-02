"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Save, Trash2, Plus, Loader, Clapperboard, Edit, User, Shirt, Sparkles, Film, Wand2, FileImage, UploadCloud, FileText, Search, MessageSquare, Briefcase, Users, Camera, Package, Code } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGallery } from "@/hooks/use-gallery";
import { useAvatars } from "@/hooks/use-avatars";
import { useProducts } from "@/hooks/use-products";
import { generateVideoAction, generateTitleAction, generateActionAction, analyzeImageAction, analyzeTextAction, generateDialogueAction, generateSeoAction, analyzeAvatarDetailsAction, generateScriptAction } from "@/app/actions";
import type { Scene, Avatar, Product } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(100, "Nome muito longo."),
  niche: z.string().min(1, "Nicho é obrigatório.").max(100, "Nicho muito longo."),
  scenarioPrompt: z.string().min(1, "Descrição do cenário é obrigatória.").max(1000, "Descrição muito longa."),
  actionPrompt: z.string().min(1, "Ação principal é obrigatória.").max(1000, "Descrição muito longa."),
  sceneImage: z.string().optional(),
  referenceImage: z.string().optional(),
  characteristics: z.string().optional(),
  personalityTraits: z.string().optional(),
  appearanceDetails: z.string().optional(),
  clothing: z.string().optional(),
  shortBio: z.string().optional(),
  uniqueTrait: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  dialogue: z.string().optional(),
  cameraAngle: z.string().optional(),
  duration: z.coerce.number().optional(),
  videoFormat: z.string().optional(),
  allowDigitalText: z.string().optional(),
  allowPhysicalText: z.string().optional(),
  productName: z.string().optional(),
  partnerBrand: z.string().optional(),
  productImage: z.string().optional(),
  productDescription: z.string().optional(),
  isPartnership: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AvatarForgePage() {
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [currentAvatarId, setCurrentAvatarId] = useState<string | null>(null);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const { toast } = useToast();
  const { gallery: sceneGallery, addOrUpdateScene, removeScene, isLoaded: isSceneGalleryLoaded } = useGallery();
  const { avatars, addOrUpdateAvatar, removeAvatar, isLoaded: isAvatarGalleryLoaded } = useAvatars();
  const { products, addOrUpdateProduct, removeProduct, isLoaded: isProductGalleryLoaded } = useProducts();
  const [isPending, startTransition] = useTransition();
  const [isGeneratingTitle, startTitleTransition] = useTransition();
  const [isGeneratingAction, startActionTransition] = useTransition();
  const [isAnalyzingImage, startImageAnalysisTransition] = useTransition();
  const [isAnalyzingText, startTextAnalysisTransition] = useTransition();
  const [isGeneratingDialogue, startDialogueTransition] = useTransition();
  const [isGeneratingSeo, startSeoTransition] = useTransition();
  const [isAnalyzingAvatar, startAvatarAnalysisTransition] = useTransition();
  const [isGeneratingScript, startScriptTransition] = useTransition();
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      niche: "",
      scenarioPrompt: "",
      actionPrompt: "",
      sceneImage: "",
      referenceImage: "",
      characteristics: "",
      personalityTraits: "",
      appearanceDetails: "",
      clothing: "",
      shortBio: "",
      uniqueTrait: "",
      age: "",
      gender: "",
      dialogue: "",
      cameraAngle: "dynamic",
      duration: 8,
      videoFormat: "9:16",
      allowDigitalText: "false",
      allowPhysicalText: "false",
      productName: "",
      partnerBrand: "",
      productImage: "",
      productDescription: "",
      isPartnership: false,
    },
  });
  
  const getInfluencerDescription = (data: FormData) => `
    **Nome:** ${data.name}
    **Nicho:** ${data.niche}
    **Idade:** ${data.age}
    **Gênero:** ${data.gender}
    **Biografia:** ${data.shortBio}
    **Traço Único:** ${data.uniqueTrait}
    **Traços de Personalidade:** ${data.personalityTraits}
    **Detalhes de Aparência:** ${data.appearanceDetails}
    **Vestuário:** ${data.clothing}
    **Características Adicionais:** ${data.characteristics}
  `;

  const onGenerateSubmit = form.handleSubmit((data) => {
    setVideoUrl(null);
    startTransition(async () => {
      let scenarioPrompt = `${data.scenarioPrompt}`;

      if (data.productName && data.productDescription) {
        scenarioPrompt += `\n\n**Integração de Produto:**\n- Produto: ${data.productName}\n- Marca: ${data.partnerBrand || 'N/A'}\n- Descrição: ${data.productDescription}\n- Parceria: ${data.isPartnership ? 'Sim' : 'Não'}`;
      }

      const influencerDescription = getInfluencerDescription(data);

      const result = await generateVideoAction({
        sceneTitle: data.name,
        scenarioPrompt: `${influencerDescription}\n\n**Cenário:** ${scenarioPrompt}`,
        actionPrompt: data.actionPrompt,
        sceneImageDataUri: data.sceneImage || data.productImage,
        dialogue: data.dialogue,
        cameraAngle: data.cameraAngle,
        duration: data.duration,
        videoFormat: data.videoFormat,
        allowDigitalText: data.allowDigitalText === 'true',
        allowPhysicalText: data.allowPhysicalText === 'true',
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
  
  const handleGenerateDialogue = () => {
    const scenario = form.getValues("scenarioPrompt");
    const action = form.getValues("actionPrompt");
    if (!scenario || !action) {
      toast({ variant: "destructive", title: "Faltando contexto", description: "Preencha o cenário e a ação." });
      return;
    }
    startDialogueTransition(async () => {
      const result = await generateDialogueAction({ context: `Cenário: ${scenario}, Ação: ${action}` });
      if (result.success && result.dialogue) {
        form.setValue("dialogue", result.dialogue, { shouldValidate: true });
        toast({ title: "Diálogo Gerado!" });
      } else {
        toast({ variant: "destructive", title: "Falha ao gerar diálogo", description: result.error });
      }
    });
  };

  const handleGenerateSeo = () => {
    const title = form.getValues("name");
    const scenario = form.getValues("scenarioPrompt");
    const action = form.getValues("actionPrompt");
    if (!title || !scenario || !action) {
      toast({ variant: "destructive", title: "Faltando contexto", description: "Preencha o título, cenário e ação." });
      return;
    }
    startSeoTransition(async () => {
      const result = await generateSeoAction({ context: `Título: ${title}, Cenário: ${scenario}, Ação: ${action}` });
      if (result.success && result.seo) {
        // For now, we'll just toast the result. A real app might put this in another field.
        toast({ title: "Conteúdo SEO Gerado!", description: <pre className="whitespace-pre-wrap">{result.seo}</pre>, duration: 9000 });
      } else {
        toast({ variant: "destructive", title: "Falha ao gerar SEO", description: result.error });
      }
    });
  };

  const handleSceneFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const handleReferenceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue("referenceImage", result, { shouldValidate: true });
        setReferenceImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            form.setValue("productImage", reader.result as string, { shouldValidate: true });
            toast({ title: "Imagem do Produto Carregada" });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeAndFill = () => {
    const referenceImage = form.getValues("referenceImage");
    if (!referenceImage) {
        toast({ variant: "destructive", title: "Nenhuma imagem selecionada", description: "Por favor, carregue uma foto de referência." });
        return;
    }
    startAvatarAnalysisTransition(async () => {
        const result = await analyzeAvatarDetailsAction({ photoDataUri: referenceImage });
        if (result.success && result.details) {
            const { details } = result;
            form.setValue("name", details.name, { shouldValidate: true });
            form.setValue("niche", details.niche, { shouldValidate: true });
            form.setValue("characteristics", details.characteristics, { shouldValidate: true });
            form.setValue("personalityTraits", details.personalityTraits, { shouldValidate: true });
            form.setValue("appearanceDetails", details.appearanceDetails, { shouldValidate: true });
            form.setValue("clothing", details.clothing, { shouldValidate: true });
            form.setValue("shortBio", details.shortBio, { shouldValidate: true });
            form.setValue("uniqueTrait", details.uniqueTrait, { shouldValidate: true });
            form.setValue("age", details.age, { shouldValidate: true });
            form.setValue("gender", details.gender, { shouldValidate: true });
            toast({ title: "Análise Concluída", description: "Todos os campos do avatar foram preenchidos." });
        } else {
            toast({ variant: "destructive", title: "Falha na Análise", description: result.error });
        }
    });
};
  
  const handleAnalyzeText = () => {
    const characteristics = form.getValues("characteristics");
    if (!characteristics) {
      toast({ variant: "destructive", title: "Nenhum texto para analisar", description: "Por favor, cole as características do influenciador." });
      return;
    }
    startTextAnalysisTransition(async () => {
      const result = await analyzeTextAction({ text: characteristics });
      if (result.success && result.name && result.niche) {
        form.setValue("name", result.name, { shouldValidate: true });
        form.setValue("niche", result.niche, { shouldValidate: true });
        toast({ title: "Análise de Texto Concluída", description: "O nome e o nicho foram preenchidos." });
      } else {
        toast({ variant: "destructive", title: "Falha na Análise de Texto", description: result.error });
      }
    });
  };

  const handleGenerateScript = (outputFormat: 'markdown' | 'json') => {
      const formData = form.getValues();
      const influencerDetails = getInfluencerDescription(formData);
      const sceneDetails = formData.scenarioPrompt;

      if (!formData.name || !sceneDetails) {
          toast({ variant: "destructive", title: "Faltando Contexto", description: "Para gerar, é preciso carregar ou guardar um influenciador e preencher o campo 'Cenário' na cena." });
          return;
      }
      
      startScriptTransition(async () => {
          const result = await generateScriptAction({
              influencerDetails,
              sceneDetails,
              outputFormat,
          });
          if (result.success && result.script) {
              setScriptContent(result.script);
              toast({ title: "Roteiro Gerado!", description: `Seu roteiro em ${outputFormat} está pronto.` });
          } else {
              toast({ variant: "destructive", title: "Falha ao Gerar Roteiro", description: result.error });
          }
      });
  };


  const handleSaveScene = (data: FormData) => {
    const id = currentSceneId || crypto.randomUUID();
    addOrUpdateScene({ id, ...data });
    if (!currentSceneId) setCurrentSceneId(id);
    toast({
      title: "Salvo na Galeria",
      description: `Cena "${data.name}" foi salva.`,
    });
  };

  const handleLoadScene = (scene: Scene) => {
    form.reset(scene);
    setCurrentSceneId(scene.id);
    setVideoUrl(null);
    setReferenceImagePreview(scene.referenceImage || null);
    toast({
      title: "Cena Carregada",
      description: `Carregado "${scene.name}" no editor.`,
    });
  };

  const handleNewScene = () => {
    form.reset({ name: "", niche: "", scenarioPrompt: "", actionPrompt: "", sceneImage: "", referenceImage: "", characteristics: "", personalityTraits: "", appearanceDetails: "", clothing: "", shortBio: "", uniqueTrait: "", age: "", gender: "", dialogue: "", cameraAngle: "dynamic", duration: 8, videoFormat: "9:16", allowDigitalText: "false", allowPhysicalText: "false", productName: "", partnerBrand: "", productImage: "", productDescription: "", isPartnership: false });
    setCurrentSceneId(null);
    setCurrentAvatarId(null);
    setCurrentProductId(null);
    setVideoUrl(null);
    setReferenceImagePreview(null);
  };

  const handleDeleteScene = (id: string, name: string) => {
    removeScene(id);
    if (currentSceneId === id) {
      handleNewScene();
    }
    toast({
      title: "Cena Deletada",
      description: `"${name}" foi removido da sua galeria.`,
    });
  };
  
  const handleSaveAvatar = () => {
    const data = form.getValues();
    const id = currentAvatarId || crypto.randomUUID();
    const avatarData: Avatar = {
      id,
      name: data.name,
      niche: data.niche,
      referenceImage: data.referenceImage,
      characteristics: data.characteristics,
      personalityTraits: data.personalityTraits,
      appearanceDetails: data.appearanceDetails,
      clothing: data.clothing,
      shortBio: data.shortBio,
      uniqueTrait: data.uniqueTrait,
      age: data.age,
      gender: data.gender,
    };
    addOrUpdateAvatar(avatarData);
    if(!currentAvatarId) setCurrentAvatarId(id);
    toast({ title: "Avatar Salvo", description: `Avatar "${data.name}" salvo na galeria.`});
  };

  const handleLoadAvatar = (avatar: Avatar) => {
    form.setValue("name", avatar.name);
    form.setValue("niche", avatar.niche);
    form.setValue("referenceImage", avatar.referenceImage);
    form.setValue("characteristics", avatar.characteristics);
    form.setValue("personalityTraits", avatar.personalityTraits);
    form.setValue("appearanceDetails", avatar.appearanceDetails);
    form.setValue("clothing", avatar.clothing);
    form.setValue("shortBio", avatar.shortBio);
    form.setValue("uniqueTrait", avatar.uniqueTrait);
    form.setValue("age", avatar.age);
    form.setValue("gender", avatar.gender);
    setReferenceImagePreview(avatar.referenceImage || null);
    setCurrentAvatarId(avatar.id);
    toast({ title: "Avatar Carregado", description: `Avatar "${avatar.name}" carregado.`});
  };
  
  const handleDeleteAvatar = (id: string, name: string) => {
    removeAvatar(id);
    toast({ title: "Avatar Deletado", description: `"${name}" foi removido.` });
  };

  const handleSaveProduct = () => {
    const data = form.getValues();
    if (!data.productName) {
        toast({ variant: "destructive", title: "Faltando Nome", description: "O nome do produto é obrigatório." });
        return;
    }
    const id = currentProductId || crypto.randomUUID();
    const productData: Product = {
      id,
      productName: data.productName,
      partnerBrand: data.partnerBrand,
      productImage: data.productImage,
      productDescription: data.productDescription,
      isPartnership: data.isPartnership,
    };
    addOrUpdateProduct(productData);
    if(!currentProductId) setCurrentProductId(id);
    toast({ title: "Produto Salvo", description: `Produto "${data.productName}" salvo na galeria.`});
  };

  const handleLoadProduct = (product: Product) => {
    form.setValue("productName", product.productName);
    form.setValue("partnerBrand", product.partnerBrand);
    form.setValue("productImage", product.productImage);
    form.setValue("productDescription", product.productDescription);
    form.setValue("isPartnership", product.isPartnership);
    setCurrentProductId(product.id);
    toast({ title: "Produto Carregado", description: `Produto "${product.productName}" carregado.`});
  };
  
  const handleDeleteProduct = (id: string, name: string) => {
    removeProduct(id);
    toast({ title: "Produto Deletado", description: `"${name}" foi removido.` });
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
                  Editor de Cena
                </CardTitle>
                <CardDescription>Crie seu avatar, defina a cena e gere o vídeo.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={onGenerateSubmit} className="space-y-6">
                    <Tabs defaultValue="scene" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                         <TabsTrigger value="scene"><Camera className="mr-2" />Cena</TabsTrigger>
                        <TabsTrigger value="avatar"><Users className="mr-2" />Avatar</TabsTrigger>
                      </TabsList>
                      <TabsContent value="avatar" className="space-y-6 pt-4">
                        <Card className="bg-muted/30">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 font-headline text-base">
                                  <UploadCloud className="text-accent"/>
                                  1. Comece com uma Imagem
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col items-center gap-4">
                              <Button type="button" variant="outline" size="lg" onClick={() => referenceFileInputRef.current?.click()}>
                                  <FileImage className="mr-2" />
                                  Escolher
                              </Button>
                              <input type="file" accept="image/*" ref={referenceFileInputRef} onChange={handleReferenceFileChange} className="hidden" />
                              
                              <div className="w-full aspect-square rounded-lg bg-black/20 flex items-center justify-center">
                                {referenceImagePreview ? (
                                  <Image src={referenceImagePreview} alt="Prévia da referência" width={200} height={200} className="object-cover rounded-md" />
                                ) : (
                                  <p className="text-muted-foreground">Prévia</p>
                                )}
                              </div>
                              
                              <Button type="button" className="w-full" onClick={handleAnalyzeAndFill} disabled={isAnalyzingAvatar || !form.getValues("referenceImage")}>
                                  {isAnalyzingAvatar ? <Loader className="animate-spin mr-2"/> : <Bot />}
                                  Analisar Imagem e Preencher Campos
                              </Button>
                              <p className="text-xs text-muted-foreground text-center">Dica: A análise preencherá todos os campos do avatar com base na imagem.</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-muted/30">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 font-headline text-base">
                                  <FileText className="text-accent"/>
                                  2. Ou Comece com Texto
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <FormField control={form.control} name="characteristics" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cole as Características</FormLabel>
                                  <FormControl><Textarea placeholder="Cole aqui um texto com as características do influenciador..." {...field} rows={5} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <Button type="button" className="w-full" onClick={handleAnalyzeText} disabled={isAnalyzingText}>
                                {isAnalyzingText ? <Loader className="animate-spin mr-2" /> : <Search />} Analisar Texto e Preencher Nome/Nicho
                              </Button>
                          </CardContent>
                        </Card>
                        
                        <div className="flex justify-end">
                            <Button type="button" variant="secondary" size="sm" onClick={handleSaveAvatar}>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Avatar
                            </Button>
                        </div>

                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl><Input placeholder="Ex: Luna Silva" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="niche" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nicho</FormLabel>
                            <FormControl><Input placeholder="Ex: Moda, Jogos" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="personalityTraits" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Traços de Personalidade</FormLabel>
                            <FormControl><Textarea placeholder="Descreva os traços de personalidade..." {...field} rows={3} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="appearanceDetails" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Detalhes de Aparência</FormLabel>
                            <FormControl><Textarea placeholder="Descreva a aparência física em detalhe extremo..." {...field} rows={4} /></FormControl>
                            <p className="text-xs text-muted-foreground">Dica: Seja detalhado - formato do rosto, cor dos olhos, textura do cabelo, etc. para melhor geração de vídeo.</p>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="clothing" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vestuário</FormLabel>
                            <FormControl><Textarea placeholder="Descreva as roupas, sapatos e acessórios que o personagem está a usar..." {...field} rows={3} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="shortBio" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografia Curta</FormLabel>
                            <FormControl><Input placeholder="Uma breve biografia..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="uniqueTrait" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Traço Único/Peculiar</FormLabel>
                            <FormControl><Input placeholder="Um traço que torna o influenciador único..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="age" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idade</FormLabel>
                            <FormControl><Input placeholder="Idade do influenciador..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="gender" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Masculino">Masculino</SelectItem>
                                <SelectItem value="Feminino">Feminino</SelectItem>
                                <SelectItem value="Não-binário">Não-binário</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>

                      <TabsContent value="scene" className="space-y-6 pt-4">
                        <FormField control={form.control} name="scenarioPrompt" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cenário</FormLabel>
                            <FormControl><Textarea placeholder="Descreva o ambiente em detalhes - iluminação, cores, objetos, atmosfera..." {...field} rows={5} /></FormControl>
                            <p className="text-xs text-muted-foreground">Dica: Seja específico sobre iluminação, cores dominantes, materiais, e atmosfera. Quanto mais detalhes, melhor o resultado.</p>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateTitle} disabled={isGeneratingTitle}>
                          {isGeneratingTitle ? <Loader className="animate-spin mr-2" /> : <Wand2 />} Gerar Título da Cena com IA
                        </Button>

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

                        <FormField control={form.control} name="dialogue" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><MessageSquare /> Diálogo</FormLabel>
                                <FormControl><Textarea placeholder="O que o influenciador diz (em Português do Brasil)..." {...field} rows={3} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleGenerateDialogue} disabled={isGeneratingDialogue}>
                                {isGeneratingDialogue ? <Loader className="animate-spin mr-2"/> : <Bot />} Gerar Diálogo
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleGenerateSeo} disabled={isGeneratingSeo}>
                                {isGeneratingSeo ? <Loader className="animate-spin mr-2"/> : <Briefcase />} Gerar SEO
                            </Button>
                        </div>

                        <FormField control={form.control} name="cameraAngle" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ângulo da Câmera</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="dynamic">Câmera Dinâmica (Criatividade da IA)</SelectItem>
                                        <SelectItem value="close-up">Close-up</SelectItem>
                                        <SelectItem value="medium-shot">Plano Médio</SelectItem>
                                        <SelectItem value="full-shot">Plano Americano</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="duration" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duração</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="5">5 seg</SelectItem>
                                        <SelectItem value="8">8 seg</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="videoFormat" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Formato do Vídeo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                                        <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                                        <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Card className="p-4 bg-muted/30">
                            <CardTitle className="text-base mb-2">Controle de Texto no Ecrã</CardTitle>
                            <div className="space-y-4">
                                <FormField control={form.control} name="allowDigitalText" render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Permite textos digitais na tela?</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Sim</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">Não</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="allowPhysicalText" render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Apenas textos físicos como rótulos e placas reais?</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Sim</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">Não</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </Card>
                        
                        <Card className="p-4 bg-muted/30">
                          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 font-headline text-base">
                                <Package className="text-accent"/>
                                Integração de Produto (Opcional)
                            </CardTitle>
                             <Button type="button" variant="secondary" size="sm" onClick={handleSaveProduct}>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Produto
                            </Button>
                          </CardHeader>
                          <CardContent className="p-0 space-y-4">
                            <FormField control={form.control} name="productName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Produto</FormLabel>
                                    <FormControl><Input placeholder="Nome do produto..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="partnerBrand" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marca Parceira</FormLabel>
                                    <FormControl><Input placeholder="Marca parceira..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="productImage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Carregue o vídeo ou a imagem do produto</FormLabel>
                                    <FormControl>
                                    <>
                                        <input type="file" accept="image/*,video/*" ref={productFileInputRef} onChange={handleProductFileChange} className="hidden" />
                                        <Button type="button" variant="outline" onClick={() => productFileInputRef.current?.click()}>
                                            <FileImage className="mr-2" />
                                            Escolher ficheiro
                                        </Button>
                                    </>
                                    </FormControl>
                                    {field.value && <p className="text-sm text-muted-foreground">Ficheiro selecionado.</p>}
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="productDescription" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição do Produto</FormLabel>
                                    <FormControl><Textarea placeholder="Descrição detalhada do produto..." {...field} rows={3} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="isPartnership" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>É uma parceria / conteúdo patrocinado.</FormLabel>
                                    </div>
                                </FormItem>
                            )} />
                          </CardContent>
                        </Card>

                        <FormField control={form.control} name="sceneImage" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gerar a partir de uma imagem de referência</FormLabel>
                            <FormControl>
                              <>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleSceneFileChange} className="hidden" />
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
                      </TabsContent>
                    </Tabs>

                    <div className="flex flex-wrap gap-2 pt-4">
                      <Button type="submit" disabled={isPending || !form.formState.isValid} className="flex-grow">
                        {isPending ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <Bot className="mr-2 h-4 w-4" />}
                        {isPending ? "Gerando..." : "Gerar Vídeo"}
                      </Button>
                      <Button type="button" variant="secondary" onClick={form.handleSubmit(handleSaveScene)} className="flex-grow">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Cena
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

             <Card className="bg-card/80">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                        <Edit className="text-accent" />
                        3. Gere o Roteiro Detalhado
                    </CardTitle>
                    <CardDescription>Use o influenciador e a cena definidos para gerar um roteiro detalhado para um vídeo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Button
                            type="button"
                            onClick={() => handleGenerateScript('markdown')}
                            disabled={isGeneratingScript || !form.getValues("name") || !form.getValues("scenarioPrompt")}
                        >
                            {isGeneratingScript ? <Loader className="animate-spin mr-2" /> : <Bot />}
                            Gerar Roteiro (Markdown)
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleGenerateScript('json')}
                            disabled={isGeneratingScript || !form.getValues("name") || !form.getValues("scenarioPrompt")}
                        >
                           {isGeneratingScript ? <Loader className="animate-spin mr-2" /> : <Code />}
                            Gerar Roteiro (JSON)
                        </Button>
                    </div>
                     <p className="text-xs text-muted-foreground text-center">Para gerar, é preciso carregar ou guardar um influenciador e preencher o campo 'Cenário' na cena.</p>
                    {isGeneratingScript && (
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    )}
                    {scriptContent && (
                        <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/20">
                            <pre className="whitespace-pre-wrap text-sm">{scriptContent}</pre>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
            
            <Card className="bg-card/80">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between font-headline text-xl">
                        <span className="flex items-center gap-2">Galerias</span>
                        <Button variant="ghost" size="sm" onClick={handleNewScene}>
                            <Plus className="mr-2 h-4 w-4" /> Nova Cena
                        </Button>
                    </CardTitle>
                    <CardDescription>Carregue ou delete suas cenas, avatares e produtos salvos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="scenes" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="scenes">Cenas</TabsTrigger>
                            <TabsTrigger value="avatars">Avatares</TabsTrigger>
                            <TabsTrigger value="products">Produtos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="scenes" className="pt-4">
                            <ScrollArea className="h-60 pr-4">
                                <div className="space-y-3">
                                    {!isSceneGalleryLoaded && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
                                    {isSceneGalleryLoaded && sceneGallery.length === 0 && (
                                        <div className="text-center text-muted-foreground py-10"><p>Sua galeria de cenas está vazia.</p></div>
                                    )}
                                    {isSceneGalleryLoaded && sceneGallery.map((scene) => (
                                        <div key={scene.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 transition-colors">
                                            <span className="font-medium truncate pr-2">{scene.name}</span>
                                            <div className="flex gap-1 shrink-0">
                                                <Button variant="outline" size="sm" onClick={() => handleLoadScene(scene)}>Carregar</Button>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteScene(scene.id, scene.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="avatars" className="pt-4">
                            <ScrollArea className="h-60 pr-4">
                                <div className="space-y-3">
                                    {!isAvatarGalleryLoaded && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
                                    {isAvatarGalleryLoaded && avatars.length === 0 && (
                                        <div className="text-center text-muted-foreground py-10"><p>Sua galeria de avatares está vazia.</p></div>
                                    )}
                                    {isAvatarGalleryLoaded && avatars.map((avatar) => (
                                        <div key={avatar.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 transition-colors">
                                            <span className="font-medium truncate pr-2">{avatar.name}</span>
                                            <div className="flex gap-1 shrink-0">
                                                <Button variant="outline" size="sm" onClick={() => handleLoadAvatar(avatar)}>Carregar</Button>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteAvatar(avatar.id, avatar.name)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="products" className="pt-4">
                            <ScrollArea className="h-60 pr-4">
                                <div className="space-y-3">
                                    {!isProductGalleryLoaded && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
                                    {isProductGalleryLoaded && products.length === 0 && (
                                        <div className="text-center text-muted-foreground py-10"><p>Sua galeria de produtos está vazia.</p></div>
                                    )}
                                    {isProductGalleryLoaded && products.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 transition-colors">
                                            <span className="font-medium truncate pr-2">{product.productName}</span>
                                            <div className="flex gap-1 shrink-0">
                                                <Button variant="outline" size="sm" onClick={() => handleLoadProduct(product)}>Carregar</Button>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteProduct(product.id, product.productName)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
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
