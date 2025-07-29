export interface PluginFieldSchema {
  label: string;
  value: string;
  tooltip: string;
}
export interface PluginSchema {
  id: string;
  displayName: string;
  displayColor: string;
  fields: PluginFieldSchema[];
}