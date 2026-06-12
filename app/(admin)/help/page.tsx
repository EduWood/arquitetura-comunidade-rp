'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const PAGEAREA = "suporte";
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">PAGEAREA</h1>
          <p className="text-muted-foreground">Gerenciar PAGEAREA</p>
        </div>
        <Button>+ Novo</Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Gerenciador de PAGEAREA em desenvolvimento
        </div>
      </Card>
    </div>
  );
}
