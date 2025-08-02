"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Save, Trash2, Plus, Loader, Clapperboard, Edit, User, Shirt, Sparkles, Film, Wand2, FileImage, UploadCloud, FileText, Search, MessageSquare, Briefcase, Users, Camera, Package, Code, Palette, LayoutGrid, Zap, Upload, Download, FileJson, RectangleVertical, RectangleHorizontal, Square } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGallery } from "@/hooks/use-gallery";
import { useAvatars } from "@/hooks/use-avatars";
import { useProducts } from "@/hooks/use-products";
import { generateFullSceneAction, analyzeImageAction, analyzeTextAction, generateSeoAction, analyzeAvatarDetailsAction, generateScriptAction, analyzeProductImageAction } from "@/app/actions";
import type { Scene, Avatar, Product } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(100, "Nome muito longo."),
  niche: z.string().min(1, "Nicho é obrigatório.").max(100, "Nicho muito longo."),
  scenarioPrompt: z.string().min(1, "Descrição do cenário é obrigatória.").max(1000, "Descrição muito longa."),
  actionPrompt: z.string().optional(),
  negativePrompt: z.string().optional(),
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
  accent: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState("creator");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const { toast } = useToast();
  const { gallery: sceneGallery, addOrUpdateScene, removeScene, isLoaded: isSceneGalleryLoaded } = useGallery();
  const { avatars, addOrUpdateAvatar, removeAvatar, isLoaded: isAvatarGalleryLoaded } = useAvatars();
  const { products, addOrUpdateProduct, removeProduct, isLoaded: isProductGalleryLoaded } = useProducts();
  const [isPending, startTransition] = useTransition();
  const [isAnalyzingImage, startImageAnalysisTransition] = useTransition();
  const [isAnalyzingText, startTextAnalysisTransition] = useTransition();
  const [isGeneratingSeo, startSeoTransition] = useTransition();
  const [isAnalyzingAvatar, startAvatarAnalysisTransition] = useTransition();
  const [isGeneratingScript, startScriptTransition] = useTransition();
  const [isAnalyzingProduct, startProductAnalysisTransition] = useTransition();
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
      negativePrompt: "",
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
      accent: "Padrão",
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
    **Sotaque:** ${data.accent}
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

      const result = await generateFullSceneAction({
        influencerDescription,
        scenarioPrompt,
        name: data.name,
        actionPrompt: data.actionPrompt,
        dialogue: data.dialogue,
        negativePrompt: data.negativePrompt,
        sceneImageDataUri: data.sceneImage || data.productImage,
        accent: data.accent,
        cameraAngle: data.cameraAngle,
        duration: data.duration,
        videoFormat: data.videoFormat,
        allowDigitalText: data.allowDigitalText === 'true',
        allowPhysicalText: data.allowPhysicalText === 'true',
      });

      if (result.success && result.videoDataUri) {
        setVideoUrl(result.videoDataUri);
        form.setValue("name", result.generatedTitle, { shouldValidate: true });
        form.setValue("actionPrompt", result.generatedAction, { shouldValidate: true });
        form.setValue("dialogue", result.generatedDialogue, { shouldValidate: true });
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
        const dataUri = reader.result as string;
        form.setValue("sceneImage", dataUri, { shouldValidate: true });
        toast({ title: "Imagem da Cena Carregada", description: "Analisando imagem para preencher o cenário..." });

        startImageAnalysisTransition(async () => {
            const result = await analyzeImageAction({ photoDataUri: dataUri });
            if (result.success && result.description) {
                form.setValue("scenarioPrompt", result.description, { shouldValidate: true });
                toast({ title: "Análise da Cena Concluída", description: "O campo 'Cenário' foi preenchido." });
            } else {
                toast({ variant: "destructive", title: "Falha na Análise da Cena", description: result.error });
            }
        });
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
            const dataUri = reader.result as string;
            form.setValue("productImage", dataUri, { shouldValidate: true });
            toast({ title: "Imagem do Produto Carregada", description: "Analisando imagem para preencher os campos..." });

            startProductAnalysisTransition(async () => {
                const result = await analyzeProductImageAction({ photoDataUri: dataUri });
                if (result.success && result.details) {
                    const { details } = result;
                    form.setValue("productName", details.productName, { shouldValidate: true });
                    form.setValue("partnerBrand", details.partnerBrand, { shouldValidate: true });
                    form.setValue("productDescription", details.productDescription, { shouldValidate: true });
                    toast({ title: "Análise do Produto Concluída", description: "Os campos do produto foram preenchidos." });
                } else {
                    toast({ variant: "destructive", title: "Falha na Análise do Produto", description: result.error });
                }
            });
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


  const handleSaveScene = () => {
    const data = form.getValues();
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
    setActiveTab("creator");
    toast({
      title: "Cena Carregada",
      description: `Carregado "${scene.name}" no editor.`,
    });
  };

  const handleNewScene = () => {
    form.reset({ name: "", niche: "", scenarioPrompt: "", actionPrompt: "", negativePrompt: "", sceneImage: "", referenceImage: "", characteristics: "", personalityTraits: "", appearanceDetails: "", clothing: "", shortBio: "", uniqueTrait: "", age: "", gender: "", accent: "Padrão", dialogue: "", cameraAngle: "dynamic", duration: 8, videoFormat: "9:16", allowDigitalText: "false", allowPhysicalText: "false", productName: "", partnerBrand: "", productImage: "", productDescription: "", isPartnership: false });
    setCurrentSceneId(null);
    setCurrentAvatarId(null);
    setCurrentProductId(null);
    setVideoUrl(null);
    setReferenceImagePreview(null);
    setActiveTab("creator");
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
      accent: data.accent,
      negativePrompt: data.negativePrompt,
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
    form.setValue("accent", avatar.accent);
    form.setValue("negativePrompt", avatar.negativePrompt);
    setReferenceImagePreview(avatar.referenceImage || null);
    setCurrentAvatarId(avatar.id);
    setActiveTab("creator");
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
    setActiveTab("creator");
    toast({ title: "Produto Carregado", description: `Produto "${product.productName}" carregado.`});
  };
  
  const handleDeleteProduct = (id: string, name: string) => {
    removeProduct(id);
    toast({ title: "Produto Deletado", description: `"${name}" foi removido.` });
  };
  
  const showNotImplementedToast = () => {
    toast({
      title: "Funcionalidade não implementada",
      description: "Esta funcionalidade ainda está em desenvolvimento.",
    });
  };


  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clapperboard className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold font-headline text-foreground">AvatarForge</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mx-auto max-w-2xl">
              <TabsTrigger value="creator"><Film className="mr-2" />Criador</TabsTrigger>
              <TabsTrigger value="influencer-gallery"><Users className="mr-2" />Personagens</TabsTrigger>
              <TabsTrigger value="scene-gallery"><LayoutGrid className="mr-2" />Cenas</TabsTrigger>
              <TabsTrigger value="product-gallery"><Package className="mr-2" />Produtos</TabsTrigger>
            </TabsList>

            <TabsContent value="creator">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-6">

                <div className="lg:col-span-2 flex flex-col gap-8">
                  <Card className="bg-card/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline text-xl">
                        <Film className="text-accent" />
                        Editor
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
                              
                              <FormField control={form.control} name="accent" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sotaque (Português do Brasil)</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o sotaque..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Padrão">Padrão</SelectItem>
                                      <SelectItem value="Paulistano">Paulistano</SelectItem>
                                      <SelectItem value="Carioca">Carioca</SelectItem>
                                      <SelectItem value="Mineiro">Mineiro</SelectItem>
                                      <SelectItem value="Nordestino">Nordestino</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              
                               <FormField control={form.control} name="negativePrompt" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prompt Negativo (o que evitar)</FormLabel>
                                  <FormControl><Textarea placeholder="Ex: má qualidade, mãos deformadas, texto ilegível..." {...field} rows={2} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </TabsContent>

                            <TabsContent value="scene" className="space-y-6 pt-4">
                              <div className="flex items-center justify-end">
                                <Button type="button" variant="secondary" size="sm" onClick={handleSaveScene}>
                                      <Save className="mr-2 h-4 w-4" />
                                      Salvar Cena
                                </Button>
                              </div>
                              
                              <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Título da Cena</FormLabel>
                                  <FormControl><Input placeholder="Um título curto e cativante..." {...field} /></FormControl>
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
                              
                              <FormField control={form.control} name="sceneImage" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gerar a partir de uma imagem de referência</FormLabel>
                                  <FormControl>
                                    <div>
                                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleSceneFileChange} className="hidden" />
                                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzingImage}>
                                        {isAnalyzingImage ? <Loader className="animate-spin mr-2" /> : <FileImage className="mr-2" />}
                                        {isAnalyzingImage ? 'Analisando...' : 'Escolher ficheiro'}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">Preenche o campo "Cenário" ao carregar a imagem.</p>
                                  {field.value && !isAnalyzingImage && <p className="text-sm text-muted-foreground">Imagem selecionada.</p>}
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
                              
                              <FormField control={form.control} name="dialogue" render={({ field }) => (
                                  <FormItem>
                                      <FormLabel className="flex items-center gap-2"><MessageSquare /> Diálogo</FormLabel>
                                      <FormControl><Textarea placeholder="O que o influenciador diz (em Português do Brasil)..." {...field} rows={3} /></FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )} />
                              <div className="flex gap-2">
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
                                            <SelectItem value="medium">Médio</SelectItem>
                                            <SelectItem value="wide">Plano Geral</SelectItem>
                                            <SelectItem value="vlog">Vlog</SelectItem>
                                            <SelectItem value="selfie">Selfie</SelectItem>
                                            <SelectItem value="pov">Ponto de Vista (POV)</SelectItem>
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
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="9:16"><div className="flex items-center gap-2"><RectangleVertical /> Vertical (9:16)</div></SelectItem>
                                      <SelectItem value="16:9"><div className="flex items-center gap-2"><RectangleHorizontal/> Horizontal (16:9)</div></SelectItem>
                                      <SelectItem value="1:1"><div className="flex items-center gap-2"><Square /> Quadrado (1:1)</div></SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              <Card className="p-4 bg-destructive/10 border border-destructive/50">
                                  <CardTitle className="flex items-center text-base mb-2 gap-2 text-red-400">
                                      <FileText className="text-red-400" />
                                      Controle de Texto no Ecrã
                                  </CardTitle>
                                  <div className="space-y-4 text-foreground">
                                      <FormField control={form.control} name="allowDigitalText" render={({ field }) => (
                                          <FormItem className="space-y-2 flex justify-between items-center">
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
                                          <FormItem className="space-y-2 flex justify-between items-center">
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
                              
                              <Card className="p-4 bg-accent/10 border border-accent">
                                <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 font-headline text-base text-accent">
                                      <Package className="text-accent"/>
                                      Integração de Produto (Opcional)
                                  </CardTitle>
                                   <Button type="button" variant="secondary" size="sm" onClick={handleSaveProduct}>
                                      <Save className="mr-2 h-4 w-4" />
                                      Salvar Produto
                                  </Button>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="productName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Produto</FormLabel>
                                            <FormControl><Input placeholder="Nome do produto..." {...field} disabled={isAnalyzingProduct} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="partnerBrand" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marca Parceira</FormLabel>
                                            <FormControl><Input placeholder="Marca parceira..." {...field} disabled={isAnalyzingProduct} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                  </div>
                                   <FormField control={form.control} name="productImage" render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Carregue a imagem do produto</FormLabel>
                                          <FormControl>
                                          <div>
                                              <input type="file" accept="image/*" ref={productFileInputRef} onChange={handleProductFileChange} className="hidden" />
                                              <Button type="button" variant="outline" onClick={() => productFileInputRef.current?.click()} disabled={isAnalyzingProduct}>
                                                  {isAnalyzingProduct ? <Loader className="animate-spin mr-2" /> : <FileImage className="mr-2" />}
                                                  {isAnalyzingProduct ? 'Analisando...' : 'Escolher ficheiro'}
                                              </Button>
                                          </div>
                                          </FormControl>
                                          <p className="text-xs text-muted-foreground">Preenche as informações do produto ao carregar a imagem.</p>
                                          {field.value && !isAnalyzingProduct && <p className="text-sm text-muted-foreground">Ficheiro selecionado.</p>}
                                          <FormMessage />
                                      </FormItem>
                                  )} />
                                  <FormField control={form.control} name="productDescription" render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Descrição do Produto</FormLabel>
                                          <FormControl><Textarea placeholder="Descrição detalhada do produto..." {...field} rows={3} disabled={isAnalyzingProduct} /></FormControl>
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

                            </TabsContent>
                          </Tabs>

                          <div className="flex flex-wrap gap-2 pt-4">
                            <Button type="submit" disabled={isPending || !form.formState.isValid} className={cn("flex-grow", !isPending && "text-primary-foreground bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500")}>
                              {isPending ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <Bot className="mr-2 h-4 w-4" />}
                              {isPending ? "Gerando..." : "Gerar Vídeo"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-3 flex flex-col gap-8">
                  <Card className="bg-card/80">
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
                          {scriptContent ? (
                              <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/20">
                                  <pre className="whitespace-pre-wrap text-sm">{scriptContent}</pre>
                              </ScrollArea>
                          ) : (
                            <div className="h-60 w-full rounded-md border-dashed border-2 flex items-center justify-center bg-muted/20">
                              <p className="text-muted-foreground text-center">O ROTEIRO GERADO APARECE AQUI</p>
                            </div>
                          )}
                      </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="influencer-gallery">
               <Card className="mt-6">
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <div>
                              <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                  <Palette className="text-accent" />
                                  Personagens
                              </CardTitle>
                              <CardDescription>Personagens que você criou. Carregue um para editar ou gerar roteiros.</CardDescription>
                          </div>
                          <div className="flex gap-2">
                              <Button variant="outline" onClick={() => { setActiveTab("creator"); handleNewScene(); }}>
                                <Plus className="mr-2" /> Novo Personagem
                              </Button>
                               <Button variant="outline" onClick={showNotImplementedToast}>
                                <Download className="mr-2" /> Exportar para CSV
                              </Button>
                          </div>
                      </div>
                  </CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {!isAvatarGalleryLoaded && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-md" />)}
                          {isAvatarGalleryLoaded && avatars.length === 0 && (
                              <div className="text-center text-muted-foreground py-10 col-span-full"><p>Sua galeria de personagens está vazia.</p></div>
                          )}
                          {isAvatarGalleryLoaded && avatars.map((avatar) => (
                              <Card key={avatar.id} className="flex flex-col overflow-hidden">
                                  <div className="bg-black/20 aspect-square w-full flex items-center justify-center">
                                      {avatar.referenceImage ? (
                                        <Image src={avatar.referenceImage} alt={avatar.name} width={300} height={300} className="object-cover w-full h-full" />
                                      ) : (
                                        <User className="w-24 h-24 text-muted-foreground" />
                                      )}
                                  </div>
                                  <div className="p-4 flex flex-col flex-grow">
                                    <CardTitle className="truncate text-lg">{avatar.name || 'Personagem Sem Nome'}</CardTitle>
                                    <CardDescription>{avatar.niche}</CardDescription>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-grow">{avatar.shortBio}</p>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Button className="flex-1" onClick={() => handleLoadAvatar(avatar)}><Upload className="mr-2"/> Carregar</Button>
                                            <Button variant="secondary" className="flex-1" onClick={showNotImplementedToast}>Cena Rápida</Button>
                                        </div>
                                        <div className="flex justify-end items-center gap-1 mt-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8" onClick={showNotImplementedToast}>
                                                <FileJson className="h-4 w-4" />
                                                <span className="sr-only">Exportar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteAvatar(avatar.id, avatar.name)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Deletar</span>
                                            </Button>
                                        </div>
                                    </div>
                                  </div>
                              </Card>
                          ))}
                      </div>
                  </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scene-gallery">
                <Card className="mt-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                    <LayoutGrid className="text-accent" />
                                    Cenas
                                </CardTitle>
                                <CardDescription>Cenas que você salvou. Carregue uma para editar ou use-a com um influenciador para gerar um roteiro.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { setActiveTab("creator"); handleNewScene(); }}>
                                  <Plus className="mr-2" /> Nova Cena
                                </Button>
                                <Button variant="outline" onClick={showNotImplementedToast}>
                                  <Download className="mr-2" /> Exportar para CSV
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {!isSceneGalleryLoaded && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
                            {isSceneGalleryLoaded && sceneGallery.length === 0 && (
                                <div className="text-center text-muted-foreground py-10 col-span-full"><p>Sua galeria de cenas está vazia.</p></div>
                            )}
                            {isSceneGalleryLoaded && sceneGallery.map((scene) => (
                                <Card key={scene.id} className="flex flex-col overflow-hidden">
                                    <div className="p-4 flex flex-col flex-grow">
                                        <CardTitle className="truncate text-lg">{scene.name || 'Cena Sem Título'}</CardTitle>
                                        <CardDescription className="line-clamp-3 h-[60px] flex-grow mt-2">{scene.scenarioPrompt}</CardDescription>
                                        <div className="text-sm text-muted-foreground mt-2">{scene.duration || 8} seg</div>
                                    </div>
                                    <CardFooter className="flex flex-col items-stretch gap-2 pt-0 p-4">
                                        <Button onClick={() => handleLoadScene(scene)}><Upload className="mr-2 h-4 w-4" /> Carregar</Button>
                                        <div className="flex justify-end gap-1 mt-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8" onClick={showNotImplementedToast}>
                                                <FileJson className="h-4 w-4" />
                                                <span className="sr-only">Exportar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteScene(scene.id, scene.name)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Deletar</span>
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="product-gallery">
                <Card className="mt-6">
                    <CardHeader>
                       <div className="flex items-center justify-between">
                          <div>
                              <CardTitle className="flex items-center gap-2 font-headline text-xl">
                                  <Package className="text-accent" />
                                  Produtos
                              </CardTitle>
                              <CardDescription>Produtos que você salvou. Carregue um para usar em uma cena.</CardDescription>
                          </div>
                          <div className="flex gap-2">
                               <Button variant="outline" onClick={() => { setActiveTab("creator"); handleNewScene(); }}>
                                <Plus className="mr-2" /> Novo Produto
                              </Button>
                               <Button variant="outline" onClick={showNotImplementedToast}>
                                <Download className="mr-2" /> Exportar para CSV
                              </Button>
                          </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {!isProductGalleryLoaded && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-md" />)}
                            {isProductGalleryLoaded && products.length === 0 && (
                                <div className="text-center text-muted-foreground py-10 col-span-full"><p>Sua galeria de produtos está vazia.</p></div>
                            )}
                            {isProductGalleryLoaded && products.map((product) => (
                                <Card key={product.id} className="flex flex-col overflow-hidden">
                                     <div className="bg-black/20 aspect-square w-full flex items-center justify-center">
                                      {product.productImage ? (
                                        <Image src={product.productImage} alt={product.productName} width={300} height={300} className="object-cover w-full h-full" />
                                      ) : (
                                        <Package className="w-24 h-24 text-muted-foreground" />
                                      )}
                                  </div>
                                   <div className="p-4 flex flex-col flex-grow">
                                        <CardTitle className="truncate text-lg">{product.productName || 'Produto Sem Nome'}</CardTitle>
                                        <CardDescription>{product.partnerBrand}</CardDescription>
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-grow">{product.productDescription}</p>
                                        <div className="mt-4 flex flex-col gap-2">
                                            <Button className="w-full" onClick={() => handleLoadProduct(product)}><Upload className="mr-2"/> Carregar</Button>
                                            <div className="flex justify-end items-center gap-1 mt-2">
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteProduct(product.id, product.productName)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Deletar</span>
                                                </Button>
                                            </div>
                                        </div>
                                   </div>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
