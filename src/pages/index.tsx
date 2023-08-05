/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

const schema = z.object({
  image: z
    .any()
    .refine((file) => file, {
      message: "Please upload a file",
    })
    .refine((file) => file?.size < 1000000, {
      message: "File size should be less than 1MB",
    })
    .refine(
      (file) => {
        const acceptedTypes = ["image/png", "image/jpg", "image/jpeg"];
        return acceptedTypes.includes(file?.type);
      },
      {
        message: ".jpg .jpeg .png are the only accepted file types",
      },
    ),
});

export default function Home() {
  const {
    mutate: saveImageToDB,
    isLoading: saveImageToDBLoading,
    isError: saveImageToDBError,
  } = api.upload.image.useMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80",
  );
  const [imageName, setImageName] = useState("T3 Upload Local");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    formState: { errors },
    handleSubmit,
    setValue,
  } = form;

  const onImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.[0]) {
        const reader = new FileReader();
        if (
          !["image/jpeg", "image/jpg", "image/png"].includes(
            event.target.files[0].type,
          )
        ) {
          return;
        }
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = () => {
          // preview image
          setImage(reader.result as any);
        };
        setValue("image", event.target.files[0]);
        setImageName(
          event.target.files[0].name.split(".")[0] ?? "T3 Upload Local",
        );
      }
    },
    [setValue],
  );

  const onReset = () => {
    setValue("image", null);
    setImage(
      "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80",
    );
    setImageName("T3 Upload Local");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const formData = new FormData();
      formData.append("image", data.image);
      const res = await axios.post("/api/image", formData);
      if (res.data) {
        saveImageToDB({
          imageName: res.data.data.name,
          imagePath: res.data.data.path,
        });
      }
    } catch (error: any) {
      setIsError(true);
      console.log(error.response);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>T3 Upload Local</title>
        <meta name="description" content="Website for T3 Upload to Local" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center py-12 md:py-20">
        <div className="container">
          <h1 className="mb-6 scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl">
            T3 Upload Local
          </h1>

          <div className="mx-auto max-w-3xl">
            <AspectRatio
              ratio={3 / 2}
              className="mb-6 overflow-hidden rounded-xl bg-zinc-900/10"
            >
              <Image
                fill
                unoptimized
                src={image}
                alt={imageName}
                className="object-cover"
                loader={({ src }) => src}
              />
            </AspectRatio>
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                  type="file"
                  onChange={onImageChange}
                  ref={imageInputRef}
                />
                <p className="text-sm text-red-500">
                  {errors.image?.message?.toString()}
                </p>
                <div className="flex w-full justify-end">
                  <Button
                    variant="destructive"
                    className={cn("mr-3 mt-3 w-fit")}
                    onClick={onReset}
                  >
                    Reset
                  </Button>
                  <Button type="submit" className={cn("mt-3 w-fit")}>
                    Submit
                  </Button>
                </div>
              </form>
            </FormProvider>

            {isError ||
              (saveImageToDBError && (
                <p className="text-sm text-red-500">Something went wrong</p>
              ))}
            {isLoading ||
              (saveImageToDBLoading && <p className="text-sm">Uploading...</p>)}
          </div>
        </div>
      </main>
    </>
  );
}
