"use client";

import { useState } from "react";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";

import { Separator } from "@repo/ui/components/separator";
import {
  Link as LucideLink,
  DollarSign,
  Percent,
  PiggyBank,
} from "lucide-react";
import { Slider } from "@repo/ui/components/slider";
import { Switch } from "@repo/ui/components/switch";

export default function MissionValidationPage() {
  const MIN_CHARACTERS = 500;
  const [synthesis, setSynthesis] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [revenueRequest, setRevenueRequest] = useState("");
  const [price] = useState(100);
  const [contributorShare] = useState(10);
  const [additionalPercentage, setAdditionalPercentage] = useState(0);

  const handleSubmit = () => {
    // TODO: implement submission logic
    console.log({
      synthesis,
      externalLink,
      revenueRequest,
    });
  };

  const isSubmitDisabled =
    !synthesis || !externalLink || synthesis.length < MIN_CHARACTERS;

  return (
    <>
      <div className="px-6 pt-8 pb-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Mission validation</h1>
          <Button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isSubmitDisabled}
          >
            Submit my contribution
          </Button>
        </div>

        <div className="space-y-8">
          {/* Synthesis Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Synthesis</CardTitle>
              <CardDescription>What have you done ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                placeholder="Here you will explain what you've done regarding the mission"
                value={synthesis}
                onChange={(e) => setSynthesis(e.target.value)}
                className="min-h-[400px]"
              />
              <p className="text-sm text-muted-foreground">
                Minimum {MIN_CHARACTERS} characters required ({synthesis.length}
                /{MIN_CHARACTERS})
              </p>
            </CardContent>
          </Card>

          {/* External link */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">External link</h2>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Url of the full content you produce or the material you produce"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className="flex-1"
              />
              <LucideLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Titre de section */}
          <h2 className="text-lg font-semibold mb-4">Your share</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* LEFT: Revenue sharing card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Revenue sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Selling price */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Selling price of the content
                    </span>
                  </div>
                  <span className="text-base font-semibold text-foreground">
                    ${price}
                  </span>
                </div>

                {/* Initial share */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Your initial share
                    </span>
                  </div>
                  <span className="text-base font-semibold text-foreground">
                    {contributorShare} %
                  </span>
                </div>

                {/* Initial cut */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Your initial cut
                    </span>
                  </div>
                  <span className="text-base font-semibold text-green-600">
                    ${((price * contributorShare) / 100).toFixed(2)}
                  </span>
                </div>

                {/* Only display projected if additional % > 0 */}
                {additionalPercentage > 0 && (
                  <>
                    <Separator className="my-2" />
                    {/* Projected share */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Projected share
                        </span>
                      </div>
                      <span className="text-base font-semibold text-blue-600">
                        {contributorShare + additionalPercentage} %
                      </span>
                    </div>

                    {/* Projected cut */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Projected cut
                        </span>
                      </div>
                      <span className="text-base font-semibold text-blue-600">
                        $
                        {(
                          (price * (contributorShare + additionalPercentage)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* RIGHT: Request additional share */}
            <div className="flex flex-col gap-4">
              {/* Switch */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Do you want to ask for more revenue?
                </label>
                <Switch
                  checked={additionalPercentage > 0}
                  onCheckedChange={(checked: boolean) => {
                    if (!checked) {
                      setAdditionalPercentage(0);
                      setRevenueRequest("");
                    } else {
                      setAdditionalPercentage(5); // valeur par défaut si activé
                    }
                  }}
                />
              </div>

              {additionalPercentage > 0 && (
                <>
                  {/* Spacing under "You've done more ?" */}
                  <div className="space-y-4 mt-6">
                    <label className="text-sm font-medium text-foreground mb-3">
                      You've done more ?
                    </label>
                    <Textarea
                      className="mt-2"
                      placeholder="Explain to the creator and ask for more revenue"
                      value={revenueRequest}
                      onChange={(e) => setRevenueRequest(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      How much do you want to ask for ?
                    </label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[additionalPercentage]}
                        onValueChange={(val) => setAdditionalPercentage(val[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={additionalPercentage}
                        onChange={(e) =>
                          setAdditionalPercentage(Number(e.target.value))
                        }
                        min="0"
                        max="100"
                        className="w-20"
                      />
                    </div>
                  </div>

                  <Button
                    variant="default"
                    className="self-end bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSubmit}
                  >
                    Send request
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
