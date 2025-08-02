"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Save, Trash2, Plus, Loader, Clapperboard, Edit, User, Shirt, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGallery } from "@/hooks/use-gallery";
import { generateVideoAction } from "@/app/actions";
import type { Influencer } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const influencerSchema = z.object({
  name: z.string().min(1, "Influencer name is required.").max(50, "Name is too long."),
  clothingPrompt: z.string().min(1, "Clothing prompt is required.").max(500, "Prompt is too long."),
  otherDetailsPrompt: z.string().max(500, "Prompt is too long."),
});

type InfluencerFormData = z.infer<typeof influencerSchema>;

export default function AvatarForgePage() {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { gallery, addOrUpdateInfluencer, removeInfluencer, isLoaded } = useGallery();
  const [isPending, startTransition] = useTransition();

  const form = useForm<InfluencerFormData>({
    resolver: zodResolver(influencerSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      clothingPrompt: "",
      otherDetailsPrompt: "",
    },
  });

  const onGenerateSubmit = form.handleSubmit((data) => {
    setVideoUrl(null);
    startTransition(async () => {
        const result = await generateVideoAction(data);
        if (result.success && result.videoDataUri) {
            setVideoUrl(result.videoDataUri);
            toast({
                title: "Video Generated!",
                description: "Your avatar video is ready.",
            });
        } else if (result.error) {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: result.error,
            });
        }
    });
  });

  const handleSaveToGallery = (data: InfluencerFormData) => {
    const id = currentId || crypto.randomUUID();
    addOrUpdateInfluencer({ id, ...data });
    if (!currentId) setCurrentId(id);
    toast({
      title: "Saved to Gallery",
      description: `Influencer "${data.name}" has been saved.`,
    });
  };

  const handleLoadInfluencer = (influencer: Influencer) => {
    form.reset(influencer);
    setCurrentId(influencer.id);
    setVideoUrl(null);
    toast({
      title: "Influencer Loaded",
      description: `Loaded "${influencer.name}" into the editor.`,
    });
  };

  const handleNewInfluencer = () => {
    form.reset({ name: "", clothingPrompt: "", otherDetailsPrompt: "" });
    setCurrentId(null);
    setVideoUrl(null);
  };

  const handleDeleteInfluencer = (id: string, name: string) => {
    removeInfluencer(id);
    if (currentId === id) {
      handleNewInfluencer();
    }
    toast({
      title: "Influencer Deleted",
      description: `"${name}" has been removed from your gallery.`,
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
                  <Edit className="text-accent" />
                  Influencer Editor
                </CardTitle>
                <CardDescription>Describe your avatar. The more detail, the better the result.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={onGenerateSubmit} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><User size={16}/>Influencer Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Nova Starr" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="clothingPrompt" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Shirt size={16}/>Clothing Prompt</FormLabel>
                        <FormControl><Textarea placeholder="A futuristic silver jacket with neon blue accents, glowing sneakers..." {...field} rows={4} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="otherDetailsPrompt" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Sparkles size={16}/>Other Details (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="Cyberpunk city background, holding a glowing cube, short pink hair..." {...field} rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={isPending || !form.formState.isValid} className="flex-grow">
                        {isPending ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <Bot className="mr-2 h-4 w-4" />}
                        {isPending ? "Generating..." : "Generate Video"}
                      </Button>
                      <Button type="button" variant="secondary" onClick={form.handleSubmit(handleSaveToGallery)} className="flex-grow">
                        <Save className="mr-2 h-4 w-4" />
                        Save to Gallery
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-headline text-xl">
                  <span className="flex items-center gap-2">My Gallery</span>
                  <Button variant="ghost" size="sm" onClick={handleNewInfluencer}>
                    <Plus className="mr-2 h-4 w-4" /> New
                  </Button>
                </CardTitle>
                <CardDescription>Load or delete your saved influencers.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60 pr-4">
                  <div className="space-y-3">
                    {!isLoaded && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
                    {isLoaded && gallery.length === 0 && (
                      <div className="text-center text-muted-foreground py-10">
                        <p>Your gallery is empty.</p>
                      </div>
                    )}
                    {isLoaded && gallery.map((influencer) => (
                      <div key={influencer.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 transition-colors">
                        <span className="font-medium truncate pr-2">{influencer.name}</span>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handleLoadInfluencer(influencer)}>Load</Button>
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
                      <p className="font-headline text-lg">Generating your avatar...</p>
                      <p className="text-sm">This may take up to a minute. Please wait.</p>
                    </div>
                  ) : videoUrl ? (
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-4 text-muted-foreground p-4">
                       <Clapperboard className="h-16 w-16 mx-auto" />
                      <p className="font-headline text-lg">Your video will appear here</p>
                      <p className="text-sm">Fill out the prompts and click "Generate Video".</p>
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
