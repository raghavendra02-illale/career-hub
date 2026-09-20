import { db } from './index.ts';
import { jobs } from './schema.ts';

export async function seedInitialJobsIfEmpty() {
  try {
    const existing = await db.select().from(jobs).limit(1);
    if (existing.length > 0) return;

    const initialJobs = [
      {
        externalId: 'job_ml_01',
        title: 'Senior Machine Learning & AI Engineer',
        company: 'Scale AI',
        location: 'Bengaluru, India (Hybrid)',
        workType: 'Hybrid',
        source: 'LinkedIn Jobs',
        url: 'https://linkedin.com/jobs/scale-ai-ml',
        salaryRange: '₹35,00,000 - ₹50,00,000',
        experienceLevel: '3–6 years',
        description: `Scale AI is seeking a talented Senior ML/AI Engineer to build enterprise generative AI evaluation pipelines and LLM fine-tuning platforms.
You will work on state-of-the-art foundation models, RLHF, and vector retrieval architectures.

Key Responsibilities:
- Design, train, and fine-tune large language models and multi-modal models.
- Implement efficient inference engines using vLLM, TensorRT-LLM, and ONNX.
- Build production-grade REST APIs and data pipelines using Python, FastAPI, and Docker.
- Orchestrate distributed training and inference workloads on Kubernetes (EKS) and AWS/GCP.
- Collaborate with product teams on evaluation benchmarks and safety guardrails.

Required Qualifications:
- 3+ years of production experience in Machine Learning, Deep Learning, and NLP.
- Strong proficiency in Python, PyTorch, SQL, and Git.
- Demonstrated experience with LLMs, Vector Databases (Pinecone, Weaviate), LangChain/LlamaIndex.
- Experience with containerization (Docker) and cloud services (AWS or GCP).
- Excellent algorithmic problem-solving and software design fundamentals.`,
        requiredSkills: JSON.stringify(['Python', 'Machine Learning', 'PyTorch', 'SQL', 'LLM', 'Docker', 'AWS', 'FastAPI', 'Kubernetes', 'REST API']),
        deadline: '2026-10-15',
        isActive: true,
      },
      {
        externalId: 'job_swe_02',
        title: 'Senior Full Stack Software Engineer',
        company: 'Stripe',
        location: 'Bengaluru / Remote',
        workType: 'Remote',
        source: 'Wellfound',
        url: 'https://wellfound.com/stripe-fullstack',
        salaryRange: '₹40,00,000 - ₹60,00,000',
        experienceLevel: '4–8 years',
        description: `Stripe is building economic infrastructure for the internet. Millions of companies use Stripe's software to accept payments and manage their businesses online.

We are looking for a Senior Full Stack Engineer to scale our Merchant Dashboard and developer API tools.

What you will do:
- Architect, build, and maintain mission-critical web applications with high reliability.
- Build responsive user interfaces in modern React, TypeScript, and Tailwind CSS.
- Develop robust, highly scalable backend services in Node.js / TypeScript and Go.
- Optimize database schemas and queries across PostgreSQL and distributed caches (Redis).
- Champion high code quality, test automation, and engineering excellence.

Requirements:
- Strong experience with React, TypeScript, Node.js, and modern frontend architectures.
- Deep understanding of relational databases (PostgreSQL), schema design, and query tuning.
- Experience designing and securing RESTful and GraphQL APIs.
- Experience with CI/CD, automated testing (Jest, Playwright), and cloud infrastructure.`,
        requiredSkills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Docker', 'GraphQL', 'Tailwind CSS']),
        deadline: '2026-10-20',
        isActive: true,
      },
      {
        externalId: 'job_emb_03',
        title: 'Embedded Systems & Firmware Engineer',
        company: 'Tesla',
        location: 'Bengaluru / Pune (On-site)',
        workType: 'On-site',
        source: 'Indeed',
        url: 'https://indeed.com/tesla-embedded',
        salaryRange: '₹28,00,000 - ₹42,00,000',
        experienceLevel: '2–5 years',
        description: `Join Tesla's Autopilot and Powertrain firmware teams to develop low-level embedded software for next-generation electric vehicles and energy products.

Responsibilities:
- Design, implement, and validate firmware in C and modern C++ for ARM Cortex-M and RISC-V microcontrollers.
- Develop device drivers for SPI, I2C, UART, CAN, and Ethernet bus architectures.
- Implement real-time scheduling algorithms on FreeRTOS and bare-metal targets.
- Debug hardware/software interfaces using oscilloscopes, logic analyzers, and JTAG.
- Perform hardware-in-the-loop (HIL) testing and adhere to ISO 26262 functional safety standards.

Requirements:
- Bachelor's or Master's degree in Electrical Engineering, Computer Science, or Robotics.
- Strong proficiency in C and C++ for embedded systems.
- Experience with RTOS (FreeRTOS, Zephyr), microcontrollers, and hardware debugging.
- Knowledge of CAN bus, automotive communication protocols, and low-power design.`,
        requiredSkills: JSON.stringify(['C', 'C++', 'RTOS', 'Embedded Systems', 'ARM', 'CAN bus', 'Firmware', 'Linux Kernel', 'Microcontrollers']),
        deadline: '2026-10-30',
        isActive: true,
      },
      {
        externalId: 'job_ds_04',
        title: 'Data Analyst & Business Intelligence Specialist',
        company: 'BCG Gamma',
        location: 'Mumbai / Hyderabad',
        workType: 'Hybrid',
        source: 'Foundit',
        url: 'https://foundit.in/bcg-data-analyst',
        salaryRange: '₹18,00,000 - ₹28,00,000',
        experienceLevel: '1–4 years',
        description: `BCG Gamma is seeking a Data Analyst to transform complex business datasets into predictive models and actionable executive dashboards.

Key Responsibilities:
- Clean, aggregate, and analyze multi-terabyte datasets using Python, SQL, and Pandas.
- Build interactive executive dashboards in Tableau and PowerBI.
- Develop predictive statistical models for customer churn, revenue forecasting, and market trends.
- Communicate data-driven insights clearly to C-suite and product leaders.

Requirements:
- Proven experience with SQL (complex queries, window functions, indexing).
- Strong proficiency in Python for data manipulation (Pandas, NumPy, Scikit-Learn).
- Experience with data visualization tools (Tableau, Power BI).
- Strong analytical intuition and communication skills.`,
        requiredSkills: JSON.stringify(['Python', 'SQL', 'Tableau', 'Data Analysis', 'Pandas', 'Power BI', 'Statistics', 'Predictive Modeling']),
        deadline: '2026-11-05',
        isActive: true,
      },
      {
        externalId: 'job_be_05',
        title: 'Backend Systems Engineer (Platform)',
        company: 'Datadog',
        location: 'Remote',
        workType: 'Remote',
        source: 'Naukri',
        url: 'https://naukri.com/datadog-backend',
        salaryRange: '₹38,00,000 - ₹55,00,000',
        experienceLevel: '3–7 years',
        description: `Datadog processes tens of trillions of events per day. We are looking for engineers passionate about distributed systems, low latency, and reliability.

What you will do:
- Design and scale distributed backend microservices handling high-throughput telemetry data.
- Build resilient asynchronous processing pipelines with Kafka, Go, and Python.
- Maintain high-availability PostgreSQL and distributed NoSQL databases.
- Automate deployment pipelines on Kubernetes clusters across multi-cloud environments.

Qualifications:
- Solid experience in Go, Python, or Java.
- Proven track record designing high-load REST or gRPC APIs.
- Experience with Kafka, RabbitMQ, or event-driven architectures.
- Experience with Docker, Kubernetes, and cloud infrastructure (AWS/GCP).`,
        requiredSkills: JSON.stringify(['Python', 'Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'Kafka', 'Microservices', 'REST API', 'GCP']),
        deadline: '2026-10-25',
        isActive: true,
      },
      {
        externalId: 'job_genai_06',
        title: 'Generative AI & LLM Solutions Engineer',
        company: 'Anthropic',
        location: 'Remote / Bengaluru',
        workType: 'Remote',
        source: 'LinkedIn Jobs',
        url: 'https://linkedin.com/jobs/anthropic-genai',
        salaryRange: '₹45,00,000 - ₹70,00,000',
        experienceLevel: '2–5 years',
        description: `Join the frontline of building helpful, harmless, and honest AI solutions.

Responsibilities:
- Build generative AI workflows, agentic loops, and RAG systems for enterprise customers.
- Evaluate model safety, hallucination mitigation, and alignment with prompt engineering.
- Implement full-stack prototypes showcasing capabilities with Python, FastAPI, and TypeScript.
- Optimize context caching, streaming responses, and token efficiency.

Requirements:
- Deep hands-on experience with LLM APIs (Gemini, Claude, GPT), embeddings, and vector stores.
- Strong proficiency in Python and modern TypeScript/React.
- Experience with frameworks like LangGraph, LlamaIndex, or AutoGen.
- Strong software engineering and API design skills.`,
        requiredSkills: JSON.stringify(['Python', 'LLM', 'LangGraph', 'FastAPI', 'TypeScript', 'Vector DB', 'Prompt Engineering', 'AI Agents']),
        deadline: '2026-11-01',
        isActive: true,
      },
      {
        externalId: 'job_devops_07',
        title: 'DevOps & Site Reliability Engineer',
        company: 'Microsoft',
        location: 'Hyderabad (Hybrid)',
        workType: 'Hybrid',
        source: 'Company Careers',
        url: 'https://careers.microsoft.com/devops',
        salaryRange: '₹30,00,000 - ₹48,00,000',
        experienceLevel: '3–6 years',
        description: `Microsoft Azure team is hiring SREs to ensure 99.999% availability of global cloud services.

Responsibilities:
- Design Infrastructure as Code using Terraform and Azure Resource Manager.
- Manage Kubernetes clusters (AKS), container security, and service meshes.
- Build CI/CD pipelines with GitHub Actions and Azure DevOps.
- Monitor service health using Prometheus, Grafana, and OpenTelemetry.

Requirements:
- Deep knowledge of Linux internals and networking protocols.
- Hands-on experience with Terraform, Docker, Kubernetes, and Azure.
- Scripting fluency in Python, Bash, or Go.`,
        requiredSkills: JSON.stringify(['Docker', 'Kubernetes', 'Terraform', 'Azure', 'Linux', 'CI/CD', 'Python', 'Prometheus']),
        deadline: '2026-11-12',
        isActive: true,
      },
      {
        externalId: 'job_fe_08',
        title: 'Frontend UI/UX Engineer',
        company: 'Figma',
        location: 'Remote',
        workType: 'Remote',
        source: 'Apna',
        url: 'https://apna.co/figma-frontend',
        salaryRange: '₹25,00,000 - ₹38,00,000',
        experienceLevel: '2–5 years',
        description: `Figma connects designers and developers around the world. We are looking for a Frontend Engineer passionate about craft, performance, and accessibility.

Responsibilities:
- Develop fluid, responsive user interfaces in React, TypeScript, and Tailwind CSS.
- Optimize rendering performance for complex interactive web applications.
- Build reusable component libraries with robust unit and integration tests.
- Collaborate closely with product designers and backend engineers.

Requirements:
- Proficiency in React, TypeScript, HTML5, CSS3/Tailwind.
- Strong eye for typography, spatial balance, and responsive design.
- Experience with state management, web performance profiling, and accessibility (WCAG AA).`,
        requiredSkills: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'UI/UX', 'JavaScript', 'CSS3']),
        deadline: '2026-10-18',
        isActive: true,
      }
    ];

    await db.insert(jobs).values(initialJobs);
    console.log('Seeded initial jobs successfully');
  } catch (err) {
    console.error('Error seeding initial jobs:', err);
  }
}
