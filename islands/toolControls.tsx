import { useState } from "preact/hooks";
import { HexColorPicker } from "react-colorful";

export interface toolSettings {
  color: string;
  size: number;
}

interface controlProps {
  settings: toolSettings;
  onSettingsChange: (settings: toolSettings) => void;
}

export default function ToolControls({ settings, onSettingsChange }: controlProps) {
  const [color, setColor] = useState("#FFFFFFF");

    const handleColorChange = (color: string) => {
        onSettingsChange({...settings, color});
    }

    const handleSizeChange = (size: number) => {
        onSettingsChange({...settings, size});
    }

  return (
    
    <div className="flex gap-8 py-6">
      <HexColorPicker color={color} onChange={handleColorChange} />
    </div>
  );
}
