Scripts para criação das tabelas:

#### Cópia Médicos ####

CREATE TABLE [dbo].[MedicosCedeco](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_profissional] [int] NULL,
	[estado_crm] [varchar](2) NULL,
	[executor] [bit] NULL,
	[id_medico] [int] NULL,
	[conselho_profissional] [varchar](50) NULL,
	[referencia] [nvarchar](max) NULL,
	[crm] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO



#### Registro de laudos médicos ####
CREATE TABLE [dbo].[RegistroLaudoMedico](
	[Id] [int] NOT NULL,
	[DataCriacao] [datetime] NOT NULL,
	[IdAtendimento] [int] NOT NULL,
	[idMedico] [int] NOT NULL,
	[RetornoApi] [text] NULL,
	[Exame] [varchar](100) NULL,
	[Procedimento] [varchar](500) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]