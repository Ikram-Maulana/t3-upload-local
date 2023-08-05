/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const uploadRouter = createTRPCRouter({
  image: publicProcedure
    .input(z.object({ imageName: z.string(), imagePath: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { imageName, imagePath } = input;
      await ctx.prisma.uploadImage.create({
        data: {
          name: imageName,
          path: imagePath,
        },
      });
      return {
        error: false,
        data: "Image uploaded successfully",
      };
    }),
});
