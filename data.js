// data.js - preguntas simples por función NIST basadas en CIS IG1
// Con analogías cotidianas para PyMEs
const questions = [
  // ========== GOBERNAR (Governance) ==========
  {
    id: 'GV.RO-1',
    category: 'Gobernar',
    text: '¿Tiene documentado quién es el responsable de ciberseguridad en su empresa? (Aunque sea alguien de tiempo parcial)',
    recommendation: 'Designe a una persona (ej. Gerente de TI, CEO) como responsable de seguridad. Es como nombrar un "capitán del barco" para la seguridad.'
  },
  {
    id: 'GV.PO-1',
    category: 'Gobernar',
    text: '¿Ha escrito por lo menos una política simple (ej. "Las contraseñas deben tener 12 caracteres")?',
    recommendation: 'Documente 3 políticas en una página: 1) Contraseñas, 2) Correos prohibidos (sin datos en texto plano), 3) Backups.'
  },
  {
    id: 'GV.RO-2',
    category: 'Gobernar',
    text: '¿Tiene una lista de sus proveedores críticos (correo, hosting, telefonía) y sabe qué datos manejan?',
    recommendation: 'Haga una lista: proveedor, datos que maneja, contacto. Es como tener una lista de "quién tiene las llaves de su casa".'
  },
  {
    id: 'GV.PO-2',
    category: 'Gobernar',
    text: '¿Ha informado a sus empleados sobre reglas básicas de seguridad (contraseñas seguras, no abrir emails sospechosos)?',
    recommendation: 'Haga una reunión de 30 min al año. Muestre ejemplos de phishing, explique contraseñas seguras. Es como un "simulacro de emergencia" anual.'
  },

  // ========== IDENTIFICAR (Identify) ==========
  {
    id: 'ID.AM-1',
    category: 'Identificar',
    text: '¿Sabe exactamente qué computadoras, servidores o dispositivos tiene la empresa?',
    recommendation: 'Haga una hoja de cálculo: dispositivo, ubicación, usuario. Actualícela cuando compre o retire equipos. Es como el inventario de una tienda.'
  },
  {
    id: 'ID.AM-2',
    category: 'Identificar',
    text: '¿Tiene un registro de qué información es crítica para su negocio? (clientes, facturación, planes)',
    recommendation: 'Liste sus datos más valiosos: 1) Información de clientes, 2) Datos contables, 3) Secretos comerciales. Clasifíquelos como "muy sensible", "sensible", "público".'
  },
  {
    id: 'ID.AM-3',
    category: 'Identificar',
    text: '¿Sabe qué aplicaciones principales usa su empresa? (correo, facturación, redes sociales, etc.)',
    recommendation: 'Liste las 10 aplicaciones más usadas. Para cada una, anote: versión, quién accede, datos que contiene. Es como un "registro de herramientas".'
  },
  {
    id: 'ID.RA-1',
    category: 'Identificar',
    text: '¿Ha pensado en los principales riesgos de seguridad que podrían afectar su negocio? (ransomware, robo de datos, acceso no autorizado)',
    recommendation: 'Identifique los 5 mayores riesgos. Para cada uno: ¿qué pasaría si ocurre? ¿qué sistemas sería peor que se pierdan? Priorice según impacto.'
  },

  // ========== PROTEGER (Protect) ==========
  {
    id: 'PR.AC-1',
    category: 'Proteger',
    text: '¿Todos los empleados tienen cuentas de usuario propias? (no compartidas, cada uno con su login)',
    recommendation: 'Asigne una cuenta única por persona. Así sabe quién hizo qué. Es como que cada empleado tenga su "tarjeta de acceso" personal.'
  },
  {
    id: 'PR.AC-2',
    category: 'Proteger',
    text: '¿Ha eliminado cuentas de empleados que ya no están en la empresa?',
    recommendation: 'Cuando alguien se va, desactive su cuenta el mismo día. Es como cambiar las cerraduras si alguien se va sin devolver llaves.'
  },
  {
    id: 'PR.AC-3',
    category: 'Proteger',
    text: '¿Usa autenticación de dos factores (2FA) en correo y sistemas críticos? (Ej: contraseña + código por SMS o app)',
    recommendation: '2FA es como tener 2 cerrojos: incluso si adivinan tu contraseña, necesitan tu celular para entrar. Actívalo en Gmail, Microsoft 365, banking.'
  },
  {
    id: 'PR.AC-4',
    category: 'Proteger',
    text: '¿Cada usuario tiene los permisos mínimos necesarios para su trabajo? (sin acceso a lo que no necesita)',
    recommendation: 'Un vendedor NO necesita ver salarios. Un contador NO necesita ver código de sistemas. Es como el "principio del menor privilegio": acceso justo y necesario.'
  },
  {
    id: 'PR.PT-1',
    category: 'Proteger',
    text: '¿Tienen protección antimalware/antivirus en todos los computadores?',
    recommendation: 'Instale antivirus gratis (Windows Defender es suficiente). Mantenlo actualizado. Es como un sistema inmunológico para tu computadora.'
  },
  {
    id: 'PR.PT-2',
    category: 'Proteger',
    text: '¿Sus computadoras y servidores reciben actualizaciones de seguridad regularmente? (parches)',
    recommendation: 'Activa actualizaciones automáticas en Windows, macOS y Linux. Para aplicaciones críticas (navegador, oficina), actualiza mensualmente. Es como "vacunas" de seguridad.'
  },
  {
    id: 'PR.PT-3',
    category: 'Proteger',
    text: '¿Sus dispositivos (laptops, teléfonos) tienen cifrado de disco habilitado?',
    recommendation: 'Activa BitLocker (Windows), FileVault (Mac), o cifrado Android/iOS. Si pierden la laptop, los datos están seguros. Es como un candado digital en el disco.'
  },
  {
    id: 'PR.DS-1',
    category: 'Proteger',
    text: '¿Tienen una política de contraseñas documentada? (largo mínimo, caracteres, cambio periódico)',
    recommendation: 'Política simple: mínimo 12 caracteres, mezcla de mayúsculas/minúsculas/números/símbolos. Cambio cada 90 días. Usa un gestor de contraseñas como Bitwarden o 1Password.'
  },
  {
    id: 'PR.DS-2',
    category: 'Proteger',
    text: '¿Evita guardar contraseñas en archivos de texto, Notas, o Post-its pegados en monitores?',
    recommendation: 'Usa un gestor de contraseñas (Bitwarden gratis, 1Password, LastPass). Una contraseña maestra fuerte: eso es. Es como una "caja fuerte digital" para todas tus claves.'
  },
  {
    id: 'PR.DS-3',
    category: 'Proteger',
    text: '¿Cifra correos o archivos que contienen información sensible (datos de clientes, salarios)?',
    recommendation: 'Para correos: usa PGP o S/MIME. Para archivos: usa 7-Zip con contraseña, o almacena en OneDrive/Google Drive con permisos restringidos. Es como enviar una carta certificada.'
  },
  {
    id: 'PR.NW-1',
    category: 'Proteger',
    text: '¿Tiene una red Wi-Fi separada para visitantes/invitados (y es diferente a la red interna)?',
    recommendation: 'Configura un "Wi-Fi invitados" sin acceso a los servidores internos. Así, si un visitante está infectado, no contamina tu red. Es como tener una "entrada separada" para invitados.'
  },
  {
    id: 'PR.NW-2',
    category: 'Proteger',
    text: '¿Usa firewall en el router? (¿Bloqueó puertos innecesarios)?',
    recommendation: 'Tu router ya tiene firewall. Revisa que solo estén abiertos los puertos que necesitas (ej. 80/443 para web). Es como cerrar puertas que no usas.'
  },
  {
    id: 'PR.NW-3',
    category: 'Proteger',
    text: '¿Usa VPN para acceso remoto o cuando se conecta a Wi-Fi público?',
    recommendation: 'VPN es como un "tubo seguro" que encripta tu tráfico. Usa ProtonVPN (gratis) o NordVPN. Crítico si accedes desde cafeterías o viajes.'
  },

  // ========== DETECTAR (Detect) ==========
  {
    id: 'DE.AE-1',
    category: 'Detectar',
    text: '¿Revisa regularmente los logs de acceso a sus sistemas? (quién entró, cuándo)',
    recommendation: 'Revisa logs de Windows/Linux 1x por semana. Busca: intentos fallidos repetidos, accesos a horas raras, usuarios deshabilitados activos. Es como revisar el "registro de visitas".'
  },
  {
    id: 'DE.AE-2',
    category: 'Detectar',
    text: '¿Monitorea alertas del antivirus u otros sistemas de detección?',
    recommendation: 'Configura alertas por correo del antivirus. Asigna a alguien (o a ti) revisar 1x por semana. Amenaza detectada = investigar y eliminar. Es como la "alarma" de seguridad.'
  },
  {
    id: 'DE.AE-3',
    category: 'Detectar',
    text: '¿Guarda registros (logs) de eventos importantes (inicios de sesión, cambios de archivos críticos)?',
    recommendation: 'Habilita auditoria en Windows, Linux. Guarda logs en un lugar central o en la nube (AWS CloudTrail, Azure Monitor). Retención mínima: 30 días.'
  },
  {
    id: 'DE.CM-1',
    category: 'Detectar',
    text: '¿Identifica software no autorizado que se instale en computadoras de la empresa?',
    recommendation: 'Usa inventario de software (ej. Lansweeper, GFI Inventory). Compara con lista "permitida". Software desconocido = investigar antes de permitir. Es como saber "qué entra a la oficina".'
  },
  {
    id: 'DE.DP-1',
    category: 'Detectar',
    text: '¿Realiza análisis periódicos de ciberseguridad? (ej. escaneo de vulnerabilidades, auditoría)',
    recommendation: 'Usa herramientas gratuitas: Nessus (prueba), OpenVAS. Escanea anualmente al menos. Reporta vulnerabilidades y arréglaa. Es como un "chequeo médico" anual.'
  },

  // ========== RESPONDER (Respond) ==========
  {
    id: 'RS.RP-1',
    category: 'Responder',
    text: '¿Tiene un plan documentado de qué hacer en caso de incidente de seguridad?',
    recommendation: 'Escribe 5 pasos: 1) Aislar el equipo/cambiar contraseñas, 2) Avisar al equipo, 3) Documentar lo ocurrido, 4) Contactar proveedor/especialista, 5) Comunicar a clientes si es necesario. Es como un "protocolo de emergencia".'
  },
  {
    id: 'RS.RP-2',
    category: 'Responder',
    text: '¿Tiene una lista de contactos clave en caso de crisis? (técnico, abogado, proveedor)',
    recommendation: 'Lista: 1) Responsable de TI, 2) Gerente, 3) Proveedor soporte técnico, 4) Asesor legal. Guárdala en papel y digital. Es como tener "números de emergencia" listos.'
  },
  {
    id: 'RS.CO-1',
    category: 'Responder',
    text: '¿Sabe cómo comunicar públicamente un incidente de seguridad sin causar pánico?',
    recommendation: 'Prepara un mensaje template: "Detectamos acceso no autorizado el X. Tomamos acción. Sus datos están seguros. Cambien contraseña por precaución." Comunica pronto pero de forma calmada.'
  },
  {
    id: 'RS.IM-1',
    category: 'Responder',
    text: '¿Aprende de incidentes pasados? (¿Documentó qué salió mal y cómo mejorará?)',
    recommendation: 'Después de cada incidente, haz una reunión: "¿Qué pasó? ¿Por qué? ¿Cómo lo prevenimos?" Documenta acciones correctivas. Es como una "auditoría post-incidente".'
  },

  // ========== RECUPERAR (Recover) ==========
  {
    id: 'RC.IM-1',
    category: 'Recuperar',
    text: '¿Realiza copias de seguridad automáticas de datos críticos?',
    recommendation: 'Configura backups automáticos cada noche: 1) Archivo local en servidor, 2) Copia en nube (OneDrive, Google Drive, AWS). Regla 3-2-1: 3 copias, 2 medios, 1 externa.'
  },
  {
    id: 'RC.IM-2',
    category: 'Recuperar',
    text: '¿Ha probado recientemente que puede recuperar datos desde un backup? (¿Está seguro de que funcionan?)',
    recommendation: 'Prueba 1x al año: borra un archivo importante deliberadamente y recúperalo del backup. Nota el tiempo, los pasos, los problemas. Es como un "simulacro de incendio".'
  },
  {
    id: 'RC.IM-3',
    category: 'Recuperar',
    text: '¿Protege los backups con cifrado y contraseña?',
    recommendation: 'Los backups son un tesoro. Encriptados con contraseña fuerte. Acceso restringido (solo el admin). Es como guardarlo en una "caja fuerte".'
  },
  {
    id: 'RC.RP-1',
    category: 'Recuperar',
    text: '¿Tiene un plan de recuperación ante desastre? (cómo restaurar operaciones si todo falla)',
    recommendation: 'Documento simple: 1) Datos más críticos, 2) Orden de restauración (correo primero, luego facturación), 3) Tiempos objetivo (ej. 4 horas para estar operativo).'
  }
];

// Pequeño set de demo (5 preguntas) para presentaciones rápidas
const demoQuestions = [
  {
    id: 'ID.AM-1',
    category: 'Identificar',
    text: '¿Sabe dónde guarda su negocio lo más importante? (como saber dónde está la caja fuerte)',
    recommendation: 'Haga una lista rápida: correo, drive, servidor, laptop. Es su "mapa del tesoro".'
  },
  {
    id: 'PR.AC-1',
    category: 'Proteger',
    text: '¿Usa doble paso (2FA) para entrar al correo y sistemas clave? (dos cerrojos en lugar de uno)',
    recommendation: 'Active 2FA en correo y paneles. Aunque adivinen su clave, necesitarán su teléfono.'
  },
  {
    id: 'DE.AE-1',
    category: 'Detectar',
    text: '¿Revisa alertas o antivirus al menos una vez por semana? (como mirar si la puerta quedó cerrada)',
    recommendation: 'Bloquee 15 minutos cada viernes para ver alertas y accesos raros.'
  },
  {
    id: 'RS.RP-1',
    category: 'Responder',
    text: '¿Sabe qué hacer si alguien entra sin permiso? (plan de emergencia en 5 pasos)',
    recommendation: '1) Aislar equipo, 2) Cambiar contraseñas, 3) Avisar, 4) Llamar soporte, 5) Documentar.'
  },
  {
    id: 'RC.IM-1',
    category: 'Recuperar',
    text: '¿Probó su backup alguna vez? (simulacro de incendio digital)',
    recommendation: 'Borre un archivo de prueba y recupérelo del backup para confirmar que funciona.'
  }
];
