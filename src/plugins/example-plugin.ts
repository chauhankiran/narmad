import { PluginAPI } from '../store/pluginStore'

PluginAPI.register({
  id: 'word-counter',
  name: 'Word Counter',
  version: '1.0.0',
  description: 'Displays word count in the status bar',
  author: 'Vista',
  hooks: {
    onActivate: () => {
      console.log('Word Counter plugin activated')
    },
    onDeactivate: () => {
      console.log('Word Counter plugin deactivated')
    },
    statusBarItems: [
      {
        id: 'word-count',
        position: 'right',
        content: () => {
          return 'Words: 0'
        },
      },
    ],
  },
})
