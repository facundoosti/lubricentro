# Voice AI Integration - Sistema Lubricentro

## 🎯 **Descripción General**

La funcionalidad de IA por voz permitirá a los usuarios interactuar con el sistema Lubricentro mediante comandos de voz, transcribiendo la voz del usuario y enviándola a una API de IA que procesará las intenciones y ejecutará acciones en el sistema.

## 🏗️ **Arquitectura del Sistema**

### **Stack Tecnológico**
- **Frontend**: `react-speech-recognition` para transcripción de voz
- **Backend**: Rails API para procesamiento de comandos
- **IA Cloud**: Claude (Anthropic) + MCP Server para procesamiento inteligente
- **Comunicación**: HTTP/REST entre componentes

### **Flujo de Datos**
```
Usuario habla → react-speech-recognition → Rails API → Claude AI → MCP Server → Rails API → Respuesta
```

## 📦 **Dependencias Frontend**

### **react-speech-recognition**
```bash
npm install react-speech-recognition
```

**Características principales:**
- Hook `useSpeechRecognition` para transcripción
- Soporte para comandos de voz personalizados
- Detección de idioma (español argentino)
- Manejo de errores de navegador
- Polyfills para compatibilidad cross-browser

### **Configuración Básica**
```javascript
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const {
  transcript,
  listening,
  resetTranscript,
  browserSupportsSpeechRecognition
} = useSpeechRecognition();
```

## 🎤 **Comandos de Voz Implementados**

### **Comandos de Clientes**
```javascript
const commands = [
  {
    command: 'crear cliente *',
    callback: (nombre) => createCustomer({ nombre })
  },
  {
    command: 'buscar cliente *',
    callback: (nombre) => searchCustomer(nombre)
  },
  {
    command: 'listar clientes',
    callback: () => listCustomers()
  }
];
```

### **Comandos de Vehículos**
```javascript
const commands = [
  {
    command: 'agregar vehículo * para *',
    callback: (patente, cliente) => addVehicle({ patente, cliente })
  },
  {
    command: 'buscar vehículo *',
    callback: (patente) => searchVehicle(patente)
  }
];
```

### **Comandos de Turnos**
```javascript
const commands = [
  {
    command: 'agendar turno para * el *',
    callback: (cliente, fecha) => scheduleAppointment({ cliente, fecha })
  },
  {
    command: 'cancelar turno de *',
    callback: (cliente) => cancelAppointment(cliente)
  }
];
```

## 🔧 **Implementación Backend**

### **Voice Controller**
```ruby
# app/controllers/api/v1/voice_controller.rb
class Api::V1::VoiceController < ApplicationController
  def process
    transcript = params[:transcript]
    user_context = { user_id: current_user&.id }
    
    begin
      result = VoiceAiService.process_voice_command(transcript, user_context)
      
      render json: {
        success: true,
        intent: result['intent'],
        response: result['response'],
        actions: result['actions_executed']
      }
      
    rescue => e
      render json: { 
        success: false,
        error: e.message 
      }, status: 500
    end
  end
end
```

### **Voice AI Service**
```ruby
# app/services/voice_ai_service.rb
class VoiceAiService
  include HTTParty
  
  base_uri ENV['VOICE_AI_SERVICE_URL']
  
  def self.process_voice_command(transcript, user_context = {})
    response = post('/process-voice', {
      body: {
        transcript: transcript,
        context: user_context
      }.to_json,
      headers: {
        'Content-Type' => 'application/json',
        'Authorization' => "Bearer #{ENV['AI_SERVICE_TOKEN']}"
      }
    })
    
    if response.success?
      response.parsed_response
    else
      raise "AI Service Error: #{response.body}"
    end
  end
end
```

## ☁️ **Servicio de IA en la Nube**

### **Arquitectura del Servicio**
```javascript
// voice-ai-service.js
import Anthropic from '@anthropic-ai/sdk';
import { spawn } from 'child_process';

class VoiceAIService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.mcpProcess = null;
    this.initializeMCP();
  }

  async processVoiceCommand(transcript, context = {}) {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `
            Eres un asistente de voz para un sistema de lubricentro.
            
            Comando del usuario: "${transcript}"
            Contexto: ${JSON.stringify(context)}
            
            Herramientas disponibles:
            - create_customer: Crear clientes
            - search_customer: Buscar clientes
            - create_vehicle: Agregar vehículos
            - schedule_appointment: Agendar turnos
            - list_services: Listar servicios
            
            Responde en formato JSON:
            {
              "intent": "descripción de la intención",
              "actions": [array de acciones],
              "response": "respuesta amigable en español"
            }
          `
        }],
        tools: await this.getMCPTools()
      });

      return this.parseAIResponse(response);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      throw error;
    }
  }
}
```

### **MCP Server para Rails API**
```javascript
// mcp-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

class RailsAPIMCPServer {
  constructor(railsApiUrl, apiKey) {
    this.railsApiUrl = railsApiUrl;
    this.apiKey = apiKey;
    this.server = new Server(
      { name: 'lubricentro-api-server', version: '1.0.0' },
      { capabilities: { resources: {}, tools: {} } }
    );
    
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'create_customer',
          description: 'Crear un nuevo cliente',
          inputSchema: {
            type: 'object',
            properties: {
              nombre: { type: 'string' },
              telefono: { type: 'string' },
              email: { type: 'string' }
            },
            required: ['nombre']
          }
        },
        {
          name: 'search_customer',
          description: 'Buscar cliente por nombre',
          inputSchema: {
            type: 'object',
            properties: {
              nombre: { type: 'string' }
            },
            required: ['nombre']
          }
        },
        {
          name: 'create_vehicle',
          description: 'Crear un nuevo vehículo',
          inputSchema: {
            type: 'object',
            properties: {
              patente: { type: 'string' },
              marca: { type: 'string' },
              modelo: { type: 'string' },
              customer_id: { type: 'number' }
            },
            required: ['patente', 'customer_id']
          }
        },
        {
          name: 'schedule_appointment',
          description: 'Agendar un turno',
          inputSchema: {
            type: 'object',
            properties: {
              fecha_hora: { type: 'string' },
              customer_id: { type: 'number' },
              vehicle_id: { type: 'number' },
              observaciones: { type: 'string' }
            },
            required: ['fecha_hora', 'customer_id']
          }
        }
      ]
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'create_customer':
          return await this.createCustomer(args);
        case 'search_customer':
          return await this.searchCustomer(args);
        case 'create_vehicle':
          return await this.createVehicle(args);
        case 'schedule_appointment':
          return await this.scheduleAppointment(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async createCustomer(userData) {
    const response = await fetch(`${this.railsApiUrl}/api/v1/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ customer: userData })
    });
    
    const result = await response.json();
    return { 
      content: [{ 
        type: 'text', 
        text: `Cliente ${userData.nombre} creado exitosamente` 
      }] 
    };
  }

  async searchCustomer(args) {
    const response = await fetch(`${this.railsApiUrl}/api/v1/customers?search=${args.nombre}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    const customers = await response.json();
    return { 
      content: [{ 
        type: 'text', 
        text: `Encontrados ${customers.data.length} clientes con el nombre ${args.nombre}` 
      }] 
    };
  }
}
```

## 🚀 **Opciones de Despliegue**

### **1. Railway/Render (Recomendado)**
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node voice-ai-service.js"
  }
}
```

### **2. AWS Lambda (Serverless)**
```javascript
// lambda-handler.js
exports.handler = async (event) => {
  const { transcript } = JSON.parse(event.body);
  
  const aiService = new VoiceAIService();
  const result = await aiService.processVoiceCommand(transcript);
  
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

### **3. Google Cloud Run**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "voice-ai-service.js"]
```

## 🔐 **Variables de Entorno**

### **Para el Servicio de IA**
```bash
ANTHROPIC_API_KEY=tu_api_key_de_claude
RAILS_API_URL=https://tu-api-rails.com
RAILS_API_TOKEN=token_de_autenticacion
PORT=8080
NODE_ENV=production
```

### **Para Rails**
```bash
VOICE_AI_SERVICE_URL=https://tu-servicio-ia.com
AI_SERVICE_TOKEN=token_de_autenticacion
```

## 🎨 **UI/UX del Botón de Voz**

### **Ubicación**
- **Posición**: Header, icono sparkles azul antes del texto "Sistema Lubricentro"
- **Tooltip**: "✨ ¡Próximamente! Esta funcionalidad está en desarrollo y llegará muy pronto."

### **Estados del Botón**
```javascript
// Estados posibles
const states = {
  idle: 'sparkles',           // Icono normal
  listening: 'microphone',    // Escuchando
  processing: 'loading',      // Procesando
  success: 'check',           // Éxito
  error: 'alert'              // Error
};
```

### **Feedback Visual**
- **Animación de pulso** cuando está escuchando
- **Indicador de volumen** en tiempo real
- **Transcripción en vivo** del audio
- **Notificaciones toast** para resultados

## 📋 **Comandos de Voz Soportados**

### **Gestión de Clientes**
- "crear cliente [nombre]"
- "buscar cliente [nombre]"
- "listar clientes"
- "editar cliente [nombre]"

### **Gestión de Vehículos**
- "agregar vehículo [patente] para [cliente]"
- "buscar vehículo [patente]"
- "listar vehículos de [cliente]"

### **Gestión de Turnos**
- "agendar turno para [cliente] el [fecha]"
- "cancelar turno de [cliente]"
- "listar turnos de hoy"
- "confirmar turno de [cliente]"

### **Gestión de Servicios**
- "listar servicios"
- "agregar servicio [nombre]"
- "buscar servicio [nombre]"

### **Comandos Generales**
- "ayuda" - Lista comandos disponibles
- "limpiar" - Limpia la transcripción
- "detener" - Detiene la escucha

## 🔄 **Estados de Desarrollo**

### **Fase 1: Setup Básico** ✅
- [x] Instalación de react-speech-recognition
- [x] Configuración del botón en header
- [x] Estructura básica del servicio

### **Fase 2: Integración Backend** 🚧
- [ ] Voice Controller en Rails
- [ ] Voice AI Service
- [ ] Endpoints de API

### **Fase 3: Servicio de IA** 📋
- [ ] Configuración de Claude API
- [ ] MCP Server setup
- [ ] Despliegue en la nube

### **Fase 4: Comandos de Voz** 📋
- [ ] Implementación de comandos básicos
- [ ] Testing de reconocimiento
- [ ] Optimización de precisión

### **Fase 5: UI/UX** 📋
- [ ] Componente de voz interactivo
- [ ] Feedback visual
- [ ] Notificaciones

## 🧪 **Testing**

### **Tests de Comandos**
```javascript
// tests/voice-commands.test.js
describe('Voice Commands', () => {
  test('should create customer via voice', async () => {
    const transcript = 'crear cliente Juan Pérez';
    const result = await processVoiceCommand(transcript);
    
    expect(result.intent).toBe('create_customer');
    expect(result.actions).toContain('customer_created');
  });
});
```

### **Tests de Integración**
```ruby
# spec/controllers/api/v1/voice_controller_spec.rb
RSpec.describe Api::V1::VoiceController, type: :controller do
  describe 'POST #process' do
    it 'processes voice command successfully' do
      post :process, params: { transcript: 'crear cliente Juan' }
      
      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body)['success']).to be true
    end
  end
end
```

## 📚 **Recursos y Referencias**

- [react-speech-recognition](https://www.npmjs.com/package/react-speech-recognition) - Documentación oficial
- [Claude API](https://docs.anthropic.com/) - Documentación de Anthropic
- [MCP Protocol](https://modelcontextprotocol.io/) - Protocolo MCP
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - API nativa del navegador

---

**Última actualización**: 20 de Junio 2024
**Estado**: En desarrollo - Fase 1 completada
**Próxima fase**: Integración Backend 