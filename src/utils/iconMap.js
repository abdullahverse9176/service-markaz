import { 
  Wrench, 
  Zap, 
  BookOpen, 
  Scissors, 
  Brush, 
  Hammer, 
  Snowflake,
  Home,
  Lightbulb,
  Paintbrush,
  Package,
  Truck,
  Smartphone
} from "lucide-react";

const iconMap = {
  Wrench,
  Zap,
  BookOpen,
  Scissors,
  Brush,
  Hammer,
  Snowflake,
  Home,
  Lightbulb,
  Paintbrush,
  Package,
  Truck,
  Smartphone
};

export const getIconComponent = (iconName) => {
  return iconMap[iconName] || Zap; // Default to Zap if icon not found
};
