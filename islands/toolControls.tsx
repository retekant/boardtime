import { ColorPicker, HStack, parseColor, Color } from "@chakra-ui/react"

export interface toolSettings {
  color: string;
  size: number;
}

interface controlProps {
  settings: toolSettings;
  onSettingsChange: (settings: toolSettings) => void;
}

export default function ToolControls({ settings, onSettingsChange }: controlProps) {

    const handleColorChange = (color: string) => {
        onSettingsChange({...settings, color});
    }

    const handleSizeChange = (size: number) => {
        onSettingsChange({...settings, size});
    }

  return (
    
    <div className="flex gap-8 py-6">
      <ColorPicker.Root 
        open 
        defaultValue={parseColor("#000")}
        onValueChange={(details: { value: Color; valueAsString: string }) => 
          handleColorChange(details.valueAsString)
        }
      >
        <ColorPicker.HiddenInput />
        <ColorPicker.Content animation="none" shadow="none" padding="0">
          <ColorPicker.Area />
          <HStack>
            <ColorPicker.EyeDropper size="xs" variant="outline" />
            <ColorPicker.Sliders />
            <ColorPicker.ValueSwatch />
          </HStack>
        </ColorPicker.Content>
      </ColorPicker.Root>
    </div>
  );
}
