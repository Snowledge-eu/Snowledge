"use client";

import { Button, Card, Input } from "@repo/ui";

export default function DisplayName() {
  return (
    <Card className="border border-border rounded-lg shadow-sm">
      <div className="px-4 py-4 md:px-6">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-semibold">Pseudo</h2>
          <p className="text-sm text-muted-foreground">
            Enter your pseudo you&apos;d like to use.
          </p>
        </div>
      </div>
      <div className="px-4 pb-4 md:px-6">
        <Input defaultValue="Shadcn Design" className="max-w-[317px]" />
      </div>
      <div className="py-4 px-4 md:px-6 border-t flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        {/* <p className="text-sm text-muted-foreground">
                    Maximum allowed length is 32 characters.
                </p> */}
        <Button>Save</Button>
      </div>
    </Card>
  );
}
