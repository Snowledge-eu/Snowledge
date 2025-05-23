"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

export function HeroSection2() {
  return (
    <section 
      className="bg-background py-16 lg:py-24"
      aria-labelledby="hero-heading"
    >
      <div className="container px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mx-auto">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:gap-8 flex-1">
          <div className="flex flex-col gap-4 lg:gap-5">
            {/* Category Tag */}
            <p 
              className="text-muted-foreground text-sm lg:text-base font-semibold"
              aria-hidden="true"
            >
              Hero section
            </p>
            {/* Main Heading */}
            <h1 
              id="hero-heading"
              className="text-foreground text-3xl md:text-5xl font-bold"
            >
              Headline that solves user's{" "}
              <span className="text-primary">main problem</span>
            </h1>
            {/* Description */}
            <p className="text-muted-foreground text-base lg:text-lg">
              Follow with one or two sentences that expand on your value
              proposition. Focus on key benefits and address why users should
              take action now. Keep it scannable, short and benefit-driven.
            </p>
          </div>

          {/* Feature List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <span className="text-card-foreground text-base font-medium leading-6">
                Benefit driven feature title
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <span className="text-card-foreground text-base font-medium leading-6">
                Benefit driven feature title
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <span className="text-card-foreground text-base font-medium leading-6">
                Benefit driven feature title
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button>Get started</Button>
            <Button variant="ghost">
              Explore
              <ArrowRight />
            </Button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 w-full">
          <AspectRatio ratio={1 / 1}>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Hero section visual"
              fill
              priority
              className="rounded-xl object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
}
