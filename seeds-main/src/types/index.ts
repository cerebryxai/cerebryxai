export interface PlantData {
  id?: string;
  species: string;
  traits: string[];
  genome: string;
  rarity: string;
  growth: number;
  environment: string;
  personality?: string;
  knowledge?: string[];
  last_interaction?: string;
  energy: number;
  experience: number;
  level: number;
  personality_traits?: Record<string, any>;
  specialization?: string;
  ai_model_config?: Record<string, any>;
  collaboration_score?: number;
  last_ai_interaction?: string;
}

export interface PlantMessage {
  id: string;
  plant_id: string;
  content: string;
  type: 'user' | 'plant' | 'growth' | 'evolution' | 'task' | 'content';
  created_at?: string;
}

export interface PlantInteraction {
  type: 'water' | 'teach' | 'collaborate' | 'evolve' | 'create' | 'assist';
  data?: any;
}

export interface PlantAbility {
  id: string;
  plant_id: string;
  name: string;
  description: string;
  type: string;
  effectiveness: number;
}

export interface PlantTask {
  id: string;
  plant_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  completed_at?: string;
}

export interface PlantContent {
  id: string;
  plant_id: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
}