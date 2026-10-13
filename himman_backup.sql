--
-- PostgreSQL database dump
--

\restrict 0Ob6ROs9QYipxzgU2izK4iGaKMvhhTvYoiDz2cFlVdc29cc9A4YVOSz11VwSwlm

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountType" AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);


ALTER TYPE public."AccountType" OWNER TO postgres;

--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApprovalStatus" OWNER TO postgres;

--
-- Name: CertificateKind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CertificateKind" AS ENUM (
    'PARTICIPANT',
    'COMMITTEE'
);


ALTER TYPE public."CertificateKind" OWNER TO postgres;

--
-- Name: CommitteeRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CommitteeRole" AS ENUM (
    'CHAIR',
    'SECRETARY',
    'TREASURER',
    'COORDINATOR',
    'MEMBER'
);


ALTER TYPE public."CommitteeRole" OWNER TO postgres;

--
-- Name: CommitteeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CommitteeStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'WAITLIST',
    'REJECTED',
    'WITHDRAWN'
);


ALTER TYPE public."CommitteeStatus" OWNER TO postgres;

--
-- Name: DuesStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DuesStatus" AS ENUM (
    'PAID',
    'PENDING',
    'OVERDUE'
);


ALTER TYPE public."DuesStatus" OWNER TO postgres;

--
-- Name: FeedbackStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FeedbackStatus" AS ENUM (
    'OPEN',
    'REVIEWED',
    'RESOLVED'
);


ALTER TYPE public."FeedbackStatus" OWNER TO postgres;

--
-- Name: LetterKind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LetterKind" AS ENUM (
    'SK',
    'SP',
    'SU',
    'SPM',
    'SPB',
    'SPP',
    'SM',
    'ST',
    'SKET',
    'SR',
    'SB',
    'SRT',
    'SPENG'
);


ALTER TYPE public."LetterKind" OWNER TO postgres;

--
-- Name: LetterNature; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LetterNature" AS ENUM (
    'KEBIJAKAN',
    'TEKNIS_KEGIATAN',
    'RUTIN'
);


ALTER TYPE public."LetterNature" OWNER TO postgres;

--
-- Name: LetterType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LetterType" AS ENUM (
    'SURAT_MASUK',
    'SURAT_KELUAR',
    'PROPOSAL',
    'LPJ'
);


ALTER TYPE public."LetterType" OWNER TO postgres;

--
-- Name: MeetingAttendanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MeetingAttendanceStatus" AS ENUM (
    'PRESENT',
    'EXCUSED'
);


ALTER TYPE public."MeetingAttendanceStatus" OWNER TO postgres;

--
-- Name: MemberStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MemberStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ALUMNI'
);


ALTER TYPE public."MemberStatus" OWNER TO postgres;

--
-- Name: OfficerPosition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OfficerPosition" AS ENUM (
    'CHAIR',
    'VICE_CHAIR',
    'SECRETARY',
    'TREASURER',
    'ADVISOR',
    'PRODI_HEAD',
    'DEAN',
    'VICE_RECTOR_3'
);


ALTER TYPE public."OfficerPosition" OWNER TO postgres;

--
-- Name: PostCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PostCategory" AS ENUM (
    'NEWS',
    'ANNOUNCEMENT',
    'ARTICLE'
);


ALTER TYPE public."PostCategory" OWNER TO postgres;

--
-- Name: RegistrationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RegistrationStatus" AS ENUM (
    'REGISTERED',
    'ATTENDED',
    'CANCELLED'
);


ALTER TYPE public."RegistrationStatus" OWNER TO postgres;

--
-- Name: RoleName; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleName" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN_EXECUTIVE',
    'MEMBER',
    'ALUMNI'
);


ALTER TYPE public."RoleName" OWNER TO postgres;

--
-- Name: TxCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TxCategory" AS ENUM (
    'DUES',
    'EVENT',
    'SPONSORSHIP',
    'OPERATIONAL',
    'UNIVERSITY_FUND',
    'DONATION',
    'BUSINESS'
);


ALTER TYPE public."TxCategory" OWNER TO postgres;

--
-- Name: TxType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TxType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


ALTER TYPE public."TxType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type public."AccountType" NOT NULL,
    is_archived boolean DEFAULT false NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    user_id text,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id text,
    meta jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificates (
    id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    certificate_number text NOT NULL,
    pdf_url text,
    issued_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    qr_code_url text,
    kind public."CertificateKind" DEFAULT 'PARTICIPANT'::public."CertificateKind" NOT NULL,
    role_title text
);


ALTER TABLE public.certificates OWNER TO postgres;

--
-- Name: cms_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_posts (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content jsonb NOT NULL,
    category public."PostCategory" NOT NULL,
    thumbnail_url text,
    published_at timestamp(3) without time zone,
    author_id text NOT NULL
);


ALTER TABLE public.cms_posts OWNER TO postgres;

--
-- Name: committee_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.committee_applications (
    id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    first_choice_id integer NOT NULL,
    second_choice_id integer,
    motivation text NOT NULL,
    experience text,
    status public."CommitteeStatus" DEFAULT 'PENDING'::public."CommitteeStatus" NOT NULL,
    role public."CommitteeRole" DEFAULT 'MEMBER'::public."CommitteeRole" NOT NULL,
    assigned_division_id integer,
    decided_by text,
    decided_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    attended_at timestamp(3) without time zone
);


ALTER TABLE public.committee_applications OWNER TO postgres;

--
-- Name: committee_divisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.committee_divisions (
    id integer NOT NULL,
    event_id text NOT NULL,
    name text NOT NULL,
    description text,
    quota integer,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.committee_divisions OWNER TO postgres;

--
-- Name: committee_divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.committee_divisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.committee_divisions_id_seq OWNER TO postgres;

--
-- Name: committee_divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.committee_divisions_id_seq OWNED BY public.committee_divisions.id;


--
-- Name: committee_meeting_attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.committee_meeting_attendances (
    id text NOT NULL,
    meeting_id text NOT NULL,
    user_id text NOT NULL,
    status public."MeetingAttendanceStatus" DEFAULT 'PRESENT'::public."MeetingAttendanceStatus" NOT NULL,
    method text DEFAULT 'SELF'::text NOT NULL,
    marked_by text,
    checked_in_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.committee_meeting_attendances OWNER TO postgres;

--
-- Name: committee_meetings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.committee_meetings (
    id text NOT NULL,
    event_id text NOT NULL,
    title text NOT NULL,
    starts_at timestamp(3) without time zone NOT NULL,
    location text,
    code text NOT NULL,
    attendance_open boolean DEFAULT false NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.committee_meetings OWNER TO postgres;

--
-- Name: divisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.divisions (
    id integer NOT NULL,
    name text NOT NULL,
    leader_id text
);


ALTER TABLE public.divisions OWNER TO postgres;

--
-- Name: divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.divisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.divisions_id_seq OWNER TO postgres;

--
-- Name: divisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.divisions_id_seq OWNED BY public.divisions.id;


--
-- Name: event_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_registrations (
    id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    status public."RegistrationStatus" DEFAULT 'REGISTERED'::public."RegistrationStatus" NOT NULL,
    attended_at timestamp(3) without time zone,
    qr_code_hash text NOT NULL
);


ALTER TABLE public.event_registrations OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    banner_url text,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    location text NOT NULL,
    quota integer,
    is_public boolean DEFAULT false NOT NULL,
    created_by text NOT NULL,
    committee_deadline timestamp(3) without time zone,
    committee_open boolean DEFAULT false NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedbacks (
    id text NOT NULL,
    is_anonymous boolean DEFAULT true NOT NULL,
    sender_id text,
    category text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status public."FeedbackStatus" DEFAULT 'OPEN'::public."FeedbackStatus" NOT NULL,
    tracking_code text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    response text,
    responded_at timestamp(3) without time zone
);


ALTER TABLE public.feedbacks OWNER TO postgres;

--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_transactions (
    id text NOT NULL,
    type public."TxType" NOT NULL,
    title text NOT NULL,
    amount numeric(14,2) NOT NULL,
    category public."TxCategory" NOT NULL,
    proof_of_payment_url text,
    verified_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text,
    verified_at timestamp(3) without time zone
);


ALTER TABLE public.financial_transactions OWNER TO postgres;

--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_lines (
    id text NOT NULL,
    transaction_id text NOT NULL,
    account_id text NOT NULL,
    amount numeric(14,2) NOT NULL,
    is_debit boolean NOT NULL,
    description text
);


ALTER TABLE public.journal_lines OWNER TO postgres;

--
-- Name: letter_counters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.letter_counters (
    year integer NOT NULL,
    type public."LetterType" NOT NULL,
    last integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.letter_counters OWNER TO postgres;

--
-- Name: member_dues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_dues (
    id text NOT NULL,
    user_id text NOT NULL,
    month_year text NOT NULL,
    amount numeric(14,2) NOT NULL,
    status public."DuesStatus" DEFAULT 'PENDING'::public."DuesStatus" NOT NULL,
    transaction_id text,
    paid_at timestamp(3) without time zone,
    proof_url text,
    submitted_at timestamp(3) without time zone
);


ALTER TABLE public.member_dues OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id text NOT NULL,
    user_id text NOT NULL,
    department text,
    division_id integer,
    status public."MemberStatus" DEFAULT 'ACTIVE'::public."MemberStatus" NOT NULL,
    kta_number text NOT NULL
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: official_letters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.official_letters (
    id text NOT NULL,
    letter_number text,
    type public."LetterType" NOT NULL,
    subject text NOT NULL,
    sender_receiver text NOT NULL,
    document_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    activity_name text,
    forwarded_at timestamp(3) without time zone,
    kind public."LetterKind",
    letter_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nature public."LetterNature",
    received_at timestamp(3) without time zone,
    summary text,
    campus_funds boolean DEFAULT false NOT NULL,
    signed_by text[] DEFAULT ARRAY[]::text[],
    event_id text
);


ALTER TABLE public.official_letters OWNER TO postgres;

--
-- Name: org_officers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_officers (
    id integer NOT NULL,
    "position" public."OfficerPosition" NOT NULL,
    user_id text,
    name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    signature_url text
);


ALTER TABLE public.org_officers OWNER TO postgres;

--
-- Name: org_officers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.org_officers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.org_officers_id_seq OWNER TO postgres;

--
-- Name: org_officers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.org_officers_id_seq OWNED BY public.org_officers.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    code text NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rate_limits (
    key text NOT NULL,
    count integer NOT NULL,
    window_start timestamp(3) with time zone NOT NULL
);


ALTER TABLE public.rate_limits OWNER TO postgres;

--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    url text NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name public."RoleName" NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    "userId" text NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    nim text NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role_id integer NOT NULL,
    approval_status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    avatar_url text,
    phone_number text,
    batch_year integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    signature_url text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: committee_divisions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_divisions ALTER COLUMN id SET DEFAULT nextval('public.committee_divisions_id_seq'::regclass);


--
-- Name: divisions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions ALTER COLUMN id SET DEFAULT nextval('public.divisions_id_seq'::regclass);


--
-- Name: org_officers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_officers ALTER COLUMN id SET DEFAULT nextval('public.org_officers_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0c50ad5f-218f-4cd1-9645-e7b6e09b9bfb	d7e3dc44753089818deeaed81c7d912a7b01bf3e5a607421c9d0662c243aba35	2026-10-06 21:43:36.894882+00	20261006214336_init	\N	\N	2026-10-06 21:43:36.309122+00	1
b1a93ad7-e26c-4d67-9e8d-69c1e6ca84dc	2f34dbbf3dd1d7c9d514f5b547fa7ae78f8fbffa7f7c6273a397417170ed5569	2026-10-07 02:43:43.881453+00	20261007024343_finance	\N	\N	2026-10-07 02:43:43.792982+00	1
c9d7f43f-b72c-4400-b08a-98453e6b761d	2a02a820c24b1d5ad22b4d57286ebbe68e6105ed7c86ba19ae2cdf9eebebf046	2026-10-07 04:54:15.279828+00	20261007100000_org_alignment	\N	\N	2026-10-07 04:54:15.231189+00	1
c7044a9d-ac4f-44ea-a38b-92bf75a42b27	373492d76ca15f9318295c97744c04e1bfe0f6bdf2f5866f1f7399ce9e2c068f	2026-10-07 07:55:02.413353+00	20261007140000_feedback_response	\N	\N	2026-10-07 07:55:02.350274+00	1
e75a929e-c89e-4476-a550-2fa75db1f065	95547528fe9a117c269e662de0760b96649d78006eed511b67a057148c372d62	2026-10-07 09:36:18.460596+00	20261007160000_resources	\N	\N	2026-10-07 09:36:18.362154+00	1
ca612025-c1db-4f5c-9938-cdfd43543cbc	6239c9055a192d1d27f1922f5223822a2e4fa9d66d6ee9086ffd32d82ebda4bf	2026-10-07 11:59:28.106316+00	20261007170000_proposal_signatures	\N	\N	2026-10-07 11:59:28.080204+00	1
ec334c0d-4b7b-4ab4-9027-c2abd59abd9f	494c7d928baec37b897399cc2c42b69d968b45cba8348832473b23cb79834cf3	2026-10-07 14:26:17.608585+00	20261007142617_init_double_entry	\N	\N	2026-10-07 14:26:17.485013+00	1
67594111-00f9-473a-b267-d20d3de95e7b	bdc932a0c9b9798f9a97d7f250653db359d02032d8dd7e7f8bc4e858f5108a32	2026-10-09 09:30:33.305202+00	20261009100000_event_committee	\N	\N	2026-10-09 09:30:33.157349+00	1
2ab5c730-742f-4c2e-a7f9-502ab2d4bfdb	ae46c38413a9c77f3c8dcb8ea705731370fb4fae05929917cb4f3785ee46e4ee	2026-10-09 12:07:21.141895+00	20261009130000_committee_attendance	\N	\N	2026-10-09 12:07:20.998583+00	1
c09eb312-a159-41ec-8723-96a1aa81f0f6	1e6afc27ff0f09a211228340a8e6b9bc4a83b8b80da7a6e57eb0f24587c3355a	2026-10-10 02:13:23.02501+00	20261010100000_rate_limit	\N	\N	2026-10-10 02:13:22.976826+00	1
3c5c688e-f258-414b-986a-dab565d466b6	b8f8720786c17a81b7fd26b0ed435e552ba0cb68e37a0f339349c65f858c9190	\N	20261010090000_committee_attendance_certificates	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261010090000_committee_attendance_certificates\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: type "CertificateKind" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \\"CertificateKind\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1175), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261010090000_committee_attendance_certificates"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261010090000_committee_attendance_certificates"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2026-10-13 01:50:35.978445+00	2026-10-13 01:44:26.232889+00	0
0215a4c4-babb-4aee-8dff-d851f5822338	707e2c87556d3854a94bd37581e648c9cbe912a4a2159c48da35d2cb680ec71f	2026-10-13 02:00:52.170109+00	20261010090000_committee_attendance_certificates	\N	\N	2026-10-13 02:00:52.044621+00	1
17236779-c051-4c3b-8de2-c3215e056746	c634389afb0d7c06593ad336ea6dece006863a9cdc2f4db03f54c8364c8041c9	2026-10-13 04:14:06.038229+00	20261013100000_org_officers	\N	\N	2026-10-13 04:14:05.955361+00	1
e964ce5a-b44e-47bd-8759-b05e0a4fdd74	bbad96ef30337bc862f783f82123a9841d9793c2524449f2a9c32e08a14c3039	2026-10-13 04:14:06.102702+00	20261013140000_signatures	\N	\N	2026-10-13 04:14:06.045938+00	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, code, name, type, is_archived) FROM stdin;
cmuy89mhc0000ijpt0n27v0j7	1110	Kas Tunai Himpunan	ASSET	f
cmuy89mht0001ijpt7e6a00ds	4110	Pendapatan Iuran Anggota (Kas)	REVENUE	f
cmuy89mif0002ijptq5mi1dsd	4120	Pendapatan Kemahasiswaan Universitas	REVENUE	f
cmuy89mir0003ijptw8svls1z	4130	Pendapatan Sponsorship Event	REVENUE	f
cmuy89mj30004ijptheai4pqz	4140	Pendapatan Donasi / Alumni	REVENUE	f
cmuy89mjg0005ijptscqhe1w2	4150	Pendapatan Usaha Dana (Danus)	REVENUE	f
cmuy89mjs0006ijptsy5qkcul	5110	Beban Operasional Rutin	EXPENSE	f
cmuy89mk40007ijptkplwd9d4	5120	Beban Pelaksanaan Kegiatan (Event)	EXPENSE	f
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (key, value, updated_at) FROM stdin;
dues_amount	2000	2026-10-07 11:08:41.608
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity, entity_id, meta, created_at) FROM stdin;
cmux8rlct0003ij1ox5h1gf4o	cmux7oyhf0001ijklnupk4fez	CREATE	events	cmux8rlby0001ij1ofzw8hkbw	\N	2026-10-06 22:19:48.318
cmuxhs7720001ijjrldhp68gc	cmux7oyhf0001ijklnupk4fez	UPDATE	events	cmux8rlby0001ij1ofzw8hkbw	\N	2026-10-07 02:32:13.167
cmuxhu7od0005ijjrev6hnnro	cmux7oyhf0001ijklnupk4fez	CHECK_IN	event_registrations	cmuxh5pn80005ij1osweavlrs	\N	2026-10-07 02:33:47.101
cmuxhuj1o0009ijjr5dp9jyee	cmux7oyhf0001ijklnupk4fez	ISSUE_CERTIFICATES	events	cmux8rlby0001ij1ofzw8hkbw	{"failed": 0, "issued": 1}	2026-10-07 02:34:01.837
cmuxi8lm20002ijprlwlqm99r	cmux7oyhf0001ijklnupk4fez	GENERATE_DUES	member_dues	\N	{"month": "2026-10", "amount": 2000, "created": 1}	2026-10-07 02:44:58.346
cmuxia3b60004ijpraintcrws	cmux7oyhf0001ijklnupk4fez	REJECT_DUES_PROOF	member_dues	cmuxi8ll10000ijpry44mp2lt	\N	2026-10-07 02:46:07.938
cmuxiaueq0008ijpr41062zn3	cmux7oyhf0001ijklnupk4fez	APPROVE_DUES	member_dues	cmuxi8ll10000ijpry44mp2lt	\N	2026-10-07 02:46:43.059
cmuxif2fy000cijpr0p4i3775	cmux7oyhf0001ijklnupk4fez	CREATE	financial_transactions	cmuxif2fl000aijpr0tcsvup1	\N	2026-10-07 02:50:00.094
cmuxifk2o000eijpr4e45hht5	cmux7oyhf0001ijklnupk4fez	VERIFY	financial_transactions	cmuxif2fl000aijpr0tcsvup1	\N	2026-10-07 02:50:22.944
cmuxj1jr9000kijpr3cyrz7ut	cmux7oyhf0001ijklnupk4fez	CREATE_MEMBER	users	cmuxj1jr2000gijpr9z5eongf	{"role": "MEMBER"}	2026-10-07 03:07:28.965
cmuxkj6fy000mijpr497mm9ui	cmux7oyhf0001ijklnupk4fez	UPDATE_MEMBER	users	cmux7oyhf0001ijklnupk4fez	{"changed": ["fullName", "email", "nim", "phoneNumber", "batchYear", "division"]}	2026-10-07 03:49:11.134
cmuxklinf000oijprhdxftb7k	cmux7oyhf0001ijklnupk4fez	UPDATE_MEMBER	users	cmux7oyhf0001ijklnupk4fez	{"changed": ["fullName"]}	2026-10-07 03:51:00.267
cmuxkllyd000qijprqywa5u4t	cmux7oyhf0001ijklnupk4fez	RESET_PASSWORD	users	cmux7oyhf0001ijklnupk4fez	\N	2026-10-07 03:51:04.549
cmuxlf0l40002ijw4795fq1jy	cmux7oyhf0001ijklnupk4fez	CREATE	official_letters	cmuxlf0l00000ijw4a7brbpbk	{"type": "PROPOSAL", "letterNumber": "001/PROP/HIMMAN/UKRI/X/2026"}	2026-10-07 04:13:56.536
cmuxtflrx0001ije4qnh66cvs	cmux7oyhf0001ijklnupk4fez	UPDATE	feedbacks	cmuxt6h3s0001ijf5py5js3l7	{"to": "REVIEWED", "from": "OPEN", "responseChanged": false}	2026-10-07 07:58:20.925
cmuxvm5y40001ij6ucdtuv2oc	cmux7oyhf0001ijklnupk4fez	RESET_PASSWORD	users	cmuxj1jr2000gijpr9z5eongf	\N	2026-10-07 08:59:26.236
cmuxvm8250003ij6ukh888vyb	cmux7oyhf0001ijklnupk4fez	UPDATE_MEMBER	users	cmuxj1jr2000gijpr9z5eongf	{"changed": ["role→ADMIN_EXECUTIVE"]}	2026-10-07 08:59:28.974
cmuxvp9y90005ij6uwtku6hj7	cmux7oyhf0001ijklnupk4fez	UPDATE_MEMBER	users	cmuxj1jr2000gijpr9z5eongf	{"changed": ["permissions"]}	2026-10-07 09:01:51.394
cmuxx6toj0003ijhz7e9ftel0	cmux7oyhf0001ijklnupk4fez	CREATE	cms_posts	cmuxx6tnx0001ijhzblb90f3l	{"status": "published"}	2026-10-07 09:43:29.731
cmuxxstgm0005ijhzxwg7su0z	cmux7oyhf0001ijklnupk4fez	UPDATE	events	cmux8rlby0001ij1ofzw8hkbw	\N	2026-10-07 10:00:35.878
cmuy06hcl0029ijzeb6xh7w8z	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:12.598
cmuy06jf3004jijze93rf4yhq	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:15.279
cmuy06lgd006tijze612rwbq0	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:17.918
cmuy06nhy0093ijzec87eiosk	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:20.566
cmuy06plo00bdijze7t0d1fbz	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:23.292
cmuy06rog00dnijzeg3vtl91z	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:25.985
cmuy06tqm00fxijze8163yzg7	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:28.655
cmuy06vzq00i7ijzesk5lh5i9	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:31.575
cmuy06y0s00khijzef9sfmo9p	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:34.204
cmuy0701500mrijzemcks3cm1	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:36.81
cmuy0720t00p1ijzerpxo01r1	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 20, "skipped": 0}	2026-10-07 11:07:39.389
cmuy073lg00qrijzebthnpovo	cmux7oyhf0001ijklnupk4fez	IMPORT_MEMBERS	users	cmux7oyhf0001ijklnupk4fez	{"failed": 0, "created": 15, "skipped": 0}	2026-10-07 11:07:41.429
cmuy085qi00qtijzerx5fcq4b	cmux7oyhf0001ijklnupk4fez	UPDATE_SETTING	app_settings	dues_amount	{"value": "2000"}	2026-10-07 11:08:30.859
cmuy08e1h00xgijze0um7f4yk	cmux7oyhf0001ijklnupk4fez	GENERATE_DUES	member_dues	\N	{"month": "2026-10", "amount": 2000, "created": 236}	2026-10-07 11:08:41.622
cmuy0dpxe00xkijzey45u93g6	cmux7oyhf0001ijklnupk4fez	APPROVE_DUES	member_dues	cmuy08e0a00qzijzesskecpt2	\N	2026-10-07 11:12:50.306
cmuy22jr40001ij6niecmemr9	cmux7oyhf0001ijklnupk4fez	UPDATE	official_letters	cmuxlf0l00000ijw4a7brbpbk	{"signedBy": ["KETUA_PELAKSANA", "KETUA_HIMPUNAN"], "replacedDocument": false}	2026-10-07 12:00:08.32
cmuy22u2o0003ij6nk88ubujd	cmux7oyhf0001ijklnupk4fez	UPDATE	official_letters	cmuxlf0l00000ijw4a7brbpbk	{"signedBy": ["KETUA_PELAKSANA", "SEKRETARIS_KEGIATAN", "KETUA_HIMPUNAN"], "replacedDocument": false}	2026-10-07 12:00:21.695
cmv0rpr0g0003ijuylb66kqsy	cmux7oyhf0001ijklnupk4fez	CREATE	events	cmv0rpr030001ijuyo8ke22i5	\N	2026-10-09 09:33:33.568
cmv0rq7uo0005ijuyltjb2qf6	cmux7oyhf0001ijklnupk4fez	COMMITTEE_DIVISION_ADD	events	cmv0rpr030001ijuyo8ke22i5	{"name": "ACARA"}	2026-10-09 09:33:55.393
cmv0rqgfq0007ijuy3d480vv9	cmux7oyhf0001ijklnupk4fez	COMMITTEE_DIVISION_ADD	events	cmv0rpr030001ijuyo8ke22i5	{"name": "LOGISTIK"}	2026-10-09 09:34:06.519
cmv0rrhwl0009ijuy78z83cac	cmux7oyhf0001ijklnupk4fez	COMMITTEE_SETTINGS	events	cmv0rpr030001ijuyo8ke22i5	{"open": true, "deadline": null}	2026-10-09 09:34:55.077
cmv0rxjh8000bijuynmw8vnxy	cmux7oyhf0001ijklnupk4fez	UPDATE	events	cmv0rpr030001ijuyo8ke22i5	\N	2026-10-09 09:39:37.053
cmv0rzqkb000fijuyymepm6dg	cmuy070s200nhijze2t9t38vo	COMMITTEE_APPLY	events	cmv0rpr030001ijuyo8ke22i5	\N	2026-10-09 09:41:19.548
cmv0s17z3000hijuydf7kez5g	cmux7oyhf0001ijklnupk4fez	COMMITTEE_DECIDE	committee_applications	cmv0rzqjy000dijuympwicwr7	{"role": "MEMBER", "decision": "ACCEPTED", "divisionId": 1}	2026-10-09 09:42:28.767
cmv0xan5e0003ijnsn3cpnskx	cmux7oyhf0001ijklnupk4fez	CREATE	events	cmv0xan510001ijnsq31m2muq	\N	2026-10-09 12:09:46.418
cmv0xbjzx0005ijnsh8mw2svv	cmux7oyhf0001ijklnupk4fez	COMMITTEE_DIVISION_ADD	events	cmv0xan510001ijnsq31m2muq	{"name": "ACARA"}	2026-10-09 12:10:28.989
cmv0xbpa70007ijnss8m2hp3a	cmux7oyhf0001ijklnupk4fez	COMMITTEE_SETTINGS	events	cmv0xan510001ijnsq31m2muq	{"open": true, "deadline": null}	2026-10-09 12:10:35.839
cmv0xcnbf000bijnsmuyc1l72	cmux7oyhf0001ijklnupk4fez	COMMITTEE_APPLY	events	cmv0xan510001ijnsq31m2muq	\N	2026-10-09 12:11:19.948
cmv0xelkq000hijns6tt9iwhn	cmuy06sdv00e9ijzef6xen1qg	COMMITTEE_APPLY	events	cmv0xan510001ijnsq31m2muq	\N	2026-10-09 12:12:51.002
cmv0xd1zx000dijns4w7c6yo9	cmux7oyhf0001ijklnupk4fez	COMMITTEE_DECIDE	committee_applications	cmv0xcnb20009ijnst7nnx89t	{"role": "MEMBER", "decision": "ACCEPTED", "divisionId": 3}	2026-10-09 12:11:38.973
cmv0xf75v000jijns01xu4hdd	cmux7oyhf0001ijklnupk4fez	COMMITTEE_DECIDE	committee_applications	cmv0xelka000fijnstwcbjgdb	{"role": "MEMBER", "decision": "ACCEPTED", "divisionId": 3}	2026-10-09 12:13:18.979
cmv62ldzm0003ijji4q47qebk	cmux7oyhf0001ijklnupk4fez	COMMITTEE_MEETING_CREATE	events	cmv0xan510001ijnsq31m2muq	{"title": "Rapat Perdana"}	2026-10-13 02:36:56.722
cmv62livj0005ijjipqht6suz	cmux7oyhf0001ijklnupk4fez	COMMITTEE_MEETING_OPEN	committee_meetings	cmv62ldzm0001ijjie4xf90jg	\N	2026-10-13 02:37:03.055
cmv6648t40001ijflijhtnt9g	cmux7oyhf0001ijklnupk4fez	UPDATE	org_officers	CHAIR	{"holderName": "Muhammad Faris Febrian Ramdan", "holderUserId": "cmux7oyhf0001ijklnupk4fez"}	2026-10-13 04:15:35.32
cmv664bbh0003ijfluo0bol7p	cmux7oyhf0001ijklnupk4fez	UPDATE	org_officers	VICE_CHAIR	{"holderName": "Ubadurahman Nurdzaky", "holderUserId": "cmuxj1jr2000gijpr9z5eongf"}	2026-10-13 04:15:38.573
cmv665vk20005ijflul9ahbhg	cmux7oyhf0001ijklnupk4fez	UPDATE	org_officers	SECRETARY	{"holderName": "Sri Aprilia Karunia Putri", "holderUserId": null}	2026-10-13 04:16:51.459
cmv665x8g0007ijflmslpqm3v	cmux7oyhf0001ijklnupk4fez	UPDATE	org_officers	TREASURER	{"holderName": "Meizela", "holderUserId": null}	2026-10-13 04:16:53.633
cmv669fv80009ijflo9vijkwg	cmux7oyhf0001ijklnupk4fez	SIGNATURE_SET	org_officers	3	\N	2026-10-13 04:19:37.748
cmv66bjqm000bijflcnz2yib3	cmux7oyhf0001ijklnupk4fez	SIGNATURE_SET	org_officers	4	\N	2026-10-13 04:21:16.078
cmv66cbm2000dijfl9zgo7ar3	cmux7oyhf0001ijklnupk4fez	UPDATE	org_officers	DEAN	{"holderName": "Dr.Hj.R.Dewi Pertiwi. Se.MM.CMA", "holderUserId": null}	2026-10-13 04:21:52.202
cmv66dcp5000fijflo7m7kwtj	cmux7oyhf0001ijklnupk4fez	SIGNATURE_SET	org_officers	5	\N	2026-10-13 04:22:40.265
cmv66dv2q000hijflml7oq6nq	cmux7oyhf0001ijklnupk4fez	UPDATE	org_officers	PRODI_HEAD	{"holderName": "Deri Apriadi S.E.MM", "holderUserId": null}	2026-10-13 04:23:04.082
cmv66f0cm000jijfl1818kye2	cmux7oyhf0001ijklnupk4fez	CREATE	org_officers	7	{"position": "ADVISOR", "holderName": "Dadar Supriatna S.E.MM"}	2026-10-13 04:23:57.574
cmv66fzgm000lijfla0vuk9b7	cmux7oyhf0001ijklnupk4fez	RESET_PASSWORD	users	cmuxj1jr2000gijpr9z5eongf	\N	2026-10-13 04:24:43.078
cmv66hxmi000nijfl67oyrk9b	cmuxj1jr2000gijpr9z5eongf	SIGNATURE_SET	users	cmuxj1jr2000gijpr9z5eongf	\N	2026-10-13 04:26:14.01
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificates (id, event_id, user_id, certificate_number, pdf_url, issued_at, qr_code_url, kind, role_title) FROM stdin;
cmuxhuirl0007ijjr4ngyww3i	cmux8rlby0001ij1ofzw8hkbw	cmux7oyhf0001ijklnupk4fez	HMN-2026-64ZB6HEY	/api/certificates/HMN-2026-64ZB6HEY/pdf	2026-10-07 02:34:01.474	http://localhost:3000/verify-certificate/HMN-2026-64ZB6HEY	PARTICIPANT	\N
\.


--
-- Data for Name: cms_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_posts (id, title, slug, content, category, thumbnail_url, published_at, author_id) FROM stdin;
cmuxx6tnx0001ijhzblb90f3l	MONDAY 2026 Fase 1	monday-2026-fase-1	{"text": "BANDUNG — Himpunan Mahasiswa Manajemen (HIMMAN) Universitas Kebangsaan Republik Indonesia sukses menyelenggarakan kegiatan Management Operation Day (MONDAY) 2026 Fase I yang bertempat di Gedung Tim Penggerak PKK. Mengusung tema besar “Born to Lead, Built to Grow”, kegiatan ini bertujuan untuk membentuk karakter, melatih jiwa kepemimpinan, serta menanamkan pola pikir adaptif dan berjiwa wirausaha bagi para mahasiswa baru."}	NEWS	/api/uploads/posts/320ba472-4d90-446f-baaa-8f94ad3fa041.jpg	2026-10-07 09:43:29.703	cmux7oyhf0001ijklnupk4fez
\.


--
-- Data for Name: committee_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committee_applications (id, event_id, user_id, first_choice_id, second_choice_id, motivation, experience, status, role, assigned_division_id, decided_by, decided_at, created_at, updated_at, attended_at) FROM stdin;
cmv0rzqjy000dijuympwicwr7	cmv0rpr030001ijuyo8ke22i5	cmuy070s200nhijze2t9t38vo	1	2	Ingin mencoba hal baru, karena saat smk saya juga sebenarnya sering mengikuti ini dan tentunya saya ingin merasakan atmosfer kepanitiaan di dunia perkuliahan	SMK	ACCEPTED	MEMBER	1	cmux7oyhf0001ijklnupk4fez	2026-10-09 09:42:28.763	2026-10-09 09:41:19.534	2026-10-09 09:42:28.767	\N
cmv0xcnb20009ijnst7nnx89t	cmv0xan510001ijnsq31m2muq	cmux7oyhf0001ijklnupk4fez	3	\N	Saya sangat ingin menjadi kepanitiaan monday karena menurut saya monday adalah kegiatan terbaik untuk belajar	\N	ACCEPTED	MEMBER	3	cmux7oyhf0001ijklnupk4fez	2026-10-09 12:11:38.97	2026-10-09 12:11:19.934	2026-10-09 12:11:38.973	\N
cmv0xelka000fijnstwcbjgdb	cmv0xan510001ijnsq31m2muq	cmuy06sdv00e9ijzef6xen1qg	3	\N	mencoba hal baru dan saya tertarik untuk belajar kenaitiaan	\N	ACCEPTED	MEMBER	3	cmux7oyhf0001ijklnupk4fez	2026-10-09 12:13:18.975	2026-10-09 12:12:50.987	2026-10-09 12:13:18.979	\N
\.


--
-- Data for Name: committee_divisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committee_divisions (id, event_id, name, description, quota, sort_order) FROM stdin;
1	cmv0rpr030001ijuyo8ke22i5	ACARA	\N	3	0
2	cmv0rpr030001ijuyo8ke22i5	LOGISTIK	\N	\N	1
3	cmv0xan510001ijnsq31m2muq	ACARA	\N	\N	0
\.


--
-- Data for Name: committee_meeting_attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committee_meeting_attendances (id, meeting_id, user_id, status, method, marked_by, checked_in_at) FROM stdin;
cmv62nto00007ijjixrbn4aky	cmv62ldzm0001ijjie4xf90jg	cmux7oyhf0001ijklnupk4fez	PRESENT	SELF	\N	2026-10-13 02:38:50.352
cmv62rrqy0009ijjis4bnlxop	cmv62ldzm0001ijjie4xf90jg	cmuy06sdv00e9ijzef6xen1qg	PRESENT	SELF	\N	2026-10-13 02:41:54.49
\.


--
-- Data for Name: committee_meetings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.committee_meetings (id, event_id, title, starts_at, location, code, attendance_open, created_by, created_at) FROM stdin;
cmv62ldzm0001ijjie4xf90jg	cmv0xan510001ijnsq31m2muq	Rapat Perdana	2026-10-13 02:38:00	\N	QR5YE8	t	cmux7oyhf0001ijklnupk4fez	2026-10-13 02:36:56.722
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.divisions (id, name, leader_id) FROM stdin;
1	BPH	\N
3	Kewirausahaan	\N
4	Pendidikan	\N
2	MedFo	\N
6	Humas	\N
8	PSDMO	\N
\.


--
-- Data for Name: event_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_registrations (id, event_id, user_id, status, attended_at, qr_code_hash) FROM stdin;
cmuxh5pn80005ij1osweavlrs	cmux8rlby0001ij1ofzw8hkbw	cmux7oyhf0001ijklnupk4fez	ATTENDED	2026-10-07 02:33:47.094	b9d141ed90a780d320317e8efe18effe
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, slug, description, banner_url, start_date, end_date, location, quota, is_public, created_by, committee_deadline, committee_open) FROM stdin;
cmux8rlby0001ij1ofzw8hkbw	KTI MASTERCLASS	kti-masterclass	Seminar Nasional Workshop KTI Masterclass - Pendidikan	/api/uploads/events/8c145e95-12c5-488b-af6c-d0f263aeecf7.png	2026-10-07 03:19:00	2026-10-07 04:19:00	Gedung Merdeka	\N	t	cmux7oyhf0001ijklnupk4fez	\N	f
cmv0rpr030001ijuyo8ke22i5	BICARA	bicara	Bincang Cerdas Bersama Mahasiswa	/api/uploads/events/9a8fcc08-ddde-46e1-b858-c64ce0003598.jpg	2026-10-09 09:40:00	2026-10-09 09:49:00	Bandung	10	f	cmux7oyhf0001ijklnupk4fez	\N	t
cmv0xan510001ijnsq31m2muq	MONDAY 2026 FASE 3	monday-2026-fase-3	MAKRAB FINAL MONDAY	\N	2026-11-06 00:08:00	2026-11-08 00:08:00	Ciwidey	300	t	cmux7oyhf0001ijklnupk4fez	\N	t
\.


--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedbacks (id, is_anonymous, sender_id, category, subject, message, status, tracking_code, created_at, response, responded_at) FROM stdin;
cmuxt6h3s0001ijf5py5js3l7	t	\N	Aspirasi	Saran dan rekomendasi terbuka untuk HIMMAN UKRI	Permisi akang teteh pengurus saya adalah salah satu dari mahasiswa fakultas ekonomi dan bisnis	REVIEWED	ASP-DV3D3WZQ	2026-10-07 07:51:14.968	\N	\N
cmv1riqpo0001ijwwsgx0alo5	f	cmux7oyhf0001ijklnupk4fez	Aspirasi	Saran dan Rekomendasi untuk HIMMAN	saya telah meneliti bahwa ada beberapa aspek yang bisa ditingkatkan daari himman itu sendiri.	OPEN	ASP-GK98CNEE	2026-10-10 02:15:52.765	\N	\N
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_transactions (id, type, title, amount, category, proof_of_payment_url, verified_by, created_at, created_by, date, note, verified_at) FROM stdin;
cmuxiauef0006ijprj4mdll2q	INCOME	Iuran kas Oktober 2026	2000.00	DUES	/api/proofs/b0494bca-cd88-471a-8847-4abe51978fab.png	cmux7oyhf0001ijklnupk4fez	2026-10-07 02:46:43.047	cmux7oyhf0001ijklnupk4fez	2026-10-07 02:46:43.036	Nama Kamu (12345678)	2026-10-07 02:46:43.036
cmuxif2fl000aijpr0tcsvup1	INCOME	Total Registrasi Peserta	100000000.00	EVENT	/api/proofs/9a116f8a-2656-4a7c-9c6b-ba6f8416c0b1.png	cmux7oyhf0001ijklnupk4fez	2026-10-07 02:50:00.065	cmux7oyhf0001ijklnupk4fez	2026-10-07 05:00:00	\N	2026-10-07 02:50:22.925
cmuy0dpx800xiijzew39ozpo2	INCOME	Iuran kas Oktober 2026	2000.00	DUES	/api/proofs/73b283bf-7f4a-403c-9580-ce7ffec04bcc.png	cmux7oyhf0001ijklnupk4fez	2026-10-07 11:12:50.3	cmux7oyhf0001ijklnupk4fez	2026-10-07 11:12:50.297	Alifa Bilbina Nur Zakia (20261610001)	2026-10-07 11:12:50.297
\.


--
-- Data for Name: journal_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_lines (id, transaction_id, account_id, amount, is_debit, description) FROM stdin;
cmuy89ml60009ijpt3blno8hu	cmuy0dpx800xiijzew39ozpo2	cmuy89mhc0000ijpt0n27v0j7	2000.00	t	\N
cmuy89ml6000bijpt2zgn2p2k	cmuy0dpx800xiijzew39ozpo2	cmuy89mht0001ijpt7e6a00ds	2000.00	f	\N
cmuy89mls000dijpt0naq6cxa	cmuxiauef0006ijprj4mdll2q	cmuy89mhc0000ijpt0n27v0j7	2000.00	t	\N
cmuy89mls000fijpt4tgbq4ci	cmuxiauef0006ijprj4mdll2q	cmuy89mht0001ijpt7e6a00ds	2000.00	f	\N
cmuy89mmg000hijptcq6d713v	cmuxif2fl000aijpr0tcsvup1	cmuy89mhc0000ijpt0n27v0j7	100000000.00	t	\N
cmuy89mmg000jijptw525r0ek	cmuxif2fl000aijpr0tcsvup1	cmuy89mjg0005ijptscqhe1w2	100000000.00	f	\N
\.


--
-- Data for Name: letter_counters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.letter_counters (year, type, last) FROM stdin;
2026	PROPOSAL	1
\.


--
-- Data for Name: member_dues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_dues (id, user_id, month_year, amount, status, transaction_id, paid_at, proof_url, submitted_at) FROM stdin;
cmuy08e0a00qzijzesskecpt2	cmuy06fcd0001ijze772fsrpw	2026-10	2000.00	PAID	cmuy0dpx800xiijzew39ozpo2	2026-10-07 11:12:50.297	/api/proofs/73b283bf-7f4a-403c-9580-ce7ffec04bcc.png	2026-10-07 11:11:48.976
cmuxi8ll10000ijpry44mp2lt	cmux7oyhf0001ijklnupk4fez	2026-10	2000.00	PAID	cmuxiauef0006ijprj4mdll2q	2026-10-07 02:46:43.036	/api/proofs/b0494bca-cd88-471a-8847-4abe51978fab.png	2026-10-07 02:46:33.442
cmuy08e0a00quijzeeow57sme	cmuy06i5p002zijzespj2pgbe	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00qwijzevxbb16e9	cmuy06i9z0033ijzexr0ojm8x	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00qxijzeaz0n56jq	cmuy06idd0037ijzen6hsb0u9	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00qyijzejap7iui5	cmuxj1jr2000gijpr9z5eongf	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r0ijzej4msiu8b	cmuy06fgi0005ijze2wi51top	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r1ijzewpyovjqe	cmuy06fk60009ijzevzqpkwsl	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r2ijzedzh6al6q	cmuy06fnr000dijze3mge0kqa	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r3ijzebzzsy1ry	cmuy06fra000hijzegmydi6bo	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r4ijze6bmp6dpk	cmuy06fv5000lijzemdd1ox3a	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r5ijzeovoo7c8h	cmuy06fzj000pijzefhd9mfc1	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r6ijzeuokimeq6	cmuy06g34000tijze2nqc2t3l	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r7ijze7bn0x4dx	cmuy06g6y000xijze9e8zb9mh	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r8ijzejgubvh80	cmuy06gao0011ijze1p56wfaw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00r9ijze4087gar5	cmuy06ged0015ijzeatezaz3r	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00raijzesa901211	cmuy06ghy0019ijzes3i4dtjv	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rbijzenxq6dhyj	cmuy06gli001dijzegkeqwree	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rcijze1nb8omue	cmuy06gpf001hijzecbw9sc9i	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rdijzep13et5kb	cmuy06guj001lijze16p7o9ry	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00reijze35ery24q	cmuy06gy5001pijze0cb6zz1i	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rfijzeueyd9dmv	cmuy06h1h001tijzey2mdi4v1	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rgijzeb8t7is1k	cmuy06h4x001xijzedovf1efb	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rhijzew3vwsx5h	cmuy06h8a0021ijzet8hwj3el	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00riijzezcmvqkfe	cmuy06hc20025ijze53togyfw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rjijzeyfk44ekv	cmuy06hkm002bijzeuid357yj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rkijzeipi5nvl5	cmuy06ho3002fijzeqrdr99zj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rlijzexogij4zb	cmuy06hrm002jijzesf5wcgsk	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rmijzej3gk4uzs	cmuy06hv3002nijzerv1o54fj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rnijzeqhmflegs	cmuy06hyk002rijzegdk4urms	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00roijzegg5duzgt	cmuy06i21002vijzefdspwkrd	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rpijzekbbxbtvb	cmuy06igq003bijze9e35znp3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rqijze2nlercg9	cmuy06ik2003fijzegwarxl8m	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rrijzeuoexc656	cmuy06inf003jijzepyiauwq3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rsijze9sz232oa	cmuy06ir0003nijzeq9vqist3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rtijzei1nfffh1	cmuy06iue003rijze24q9n6tw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00ruijzegrfamuy8	cmuy06ixu003vijze4hc8zfjs	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rvijzejwptkb87	cmuy06j18003zijzeo599o42r	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rwijzedeqj7hmo	cmuy06j4n0043ijzetz46nk8n	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rxijzemtmp4nhc	cmuy06j7z0047ijzejzrlk3k2	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00ryijzew68l8rrf	cmuy06jbc004bijzeq9qxtrse	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00rzijzefya8qrhb	cmuy06jeo004fijzewdr8w3as	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s0ijzev8yiae5g	cmuy06jm3004lijze1p7wih88	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s1ijze2elb0clm	cmuy06jpq004pijzejn20u965	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s2ijzeeavfd4vj	cmuy06jtu004tijze0cjpq40k	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s3ijzeie4yyuwn	cmuy06jx6004xijzeox2m9gs7	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s4ijzegurdumnk	cmuy06k0i0051ijzerlqgm4ti	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s5ijzev5mqt6am	cmuy06k3x0055ijzekq5f3wfz	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s6ijze3wd1oean	cmuy06k780059ijzeku9qhz9p	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s7ijzeca54jzqv	cmuy06kaj005dijze2wu450m8	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s8ijzegiumk6wd	cmuy06ke4005hijzez6g9a8kc	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00s9ijzeo7fd8cn6	cmuy06khg005lijze8tjvaxix	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00saijzepnsis8i4	cmuy06kkz005pijzepr4wn4ok	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00sbijze1h4v32yt	cmuy06koc005tijzelvyr7n32	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00scijze8h83s5ra	cmuy06kro005xijzef8svw0t2	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00sdijzengptlob9	cmuy06kuz0061ijzew3cdmz15	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00seijze4m53ktic	cmuy06kyd0065ijzehtrk9vvn	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00sfijze4i4ks4fa	cmuy06l1t0069ijzeutxa1a31	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00sgijze0labj069	cmuy06l56006dijzeddeay14u	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00shijze3zftlh9f	cmuy06l8o006hijze0pymhagj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00siijzeo3w8tnau	cmuy06lc6006lijzenmdopm2a	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00sjijzec20pbh55	cmuy06lfw006pijzel00zd2ph	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00skijzeoxa2uxke	cmuy06lnd006vijzen716ilsg	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00slijzez1ylz7uh	cmuy06lr7006zijze3chfohhw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00smijzeejopvajr	cmuy06lus0073ijzeyqyv0nfl	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00snijze1gs6srp8	cmuy06lya0077ijzetgyjnrog	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00soijze3o07qkvd	cmuy06m1z007bijze83bgp38w	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00spijze79bfi1e1	cmuy06m5e007fijzeonwf06zv	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00sqijzeozgo4zxz	cmuy06m8t007jijze2lkdjn8f	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00srijze7jf7r652	cmuy06mc5007nijzejjepg4m5	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00ssijzeciy5lkw5	cmuy06mfi007rijze70bdzc7o	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00stijzevg73tm6o	cmuy06miy007vijzea9pjo47l	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00suijze64haxjgh	cmuy06mmk007zijzeivp5r884	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00svijze7dx8ykft	cmuy06mq20083ijzepdvf7ldj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00swijze36sfcaml	cmuy06mtl0087ijzez5kqw1vq	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00sxijze5o183975	cmuy06mx6008bijzeg8b536ia	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00syijzeg1sdc5pa	cmuy06n0k008fijzefp3yf7fc	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00szijze2msgkqia	cmuy06n3t008jijzed3bgkkeq	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t0ijze47w0camz	cmuy06n79008nijzektxymwra	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t1ijzeky9mkedj	cmuy06nam008rijze7q0bnfgd	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t2ijze7h4rc0fe	cmuy06ne0008vijzefwvwavg9	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t3ijzel62sipq7	cmuy06nhe008zijze3n4g1n0e	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t4ijze9orll69j	cmuy06nqa0095ijzexzly1zob	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t5ijzel1g1cyie	cmuy06ntp0099ijzemxvc41m4	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t6ijzeygawy0nz	cmuy06nx1009dijzeyvn9nhvl	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t7ijzezc95gj8k	cmuy06o0o009hijzennxj0ggt	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t8ijzex9rfcx15	cmuy06o43009lijzec6quqosf	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00t9ijzegf2hguef	cmuy06o7w009pijzej1mwtc38	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00taijzee5grbc1y	cmuy06obf009tijzerw3jldyh	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00tbijze2yciy67m	cmuy06oew009xijze2dntbhmd	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00tcijzerwful58r	cmuy06oin00a1ijzeyxzau0xy	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00tdijzenbqqgbyt	cmuy06on300a5ijzej3qxi1dy	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00teijzenyqfxlgd	cmuy06oqf00a9ijze6xqo404q	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00tfijzer6nu8iou	cmuy06otv00adijzejzctn3c7	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0a00tgijzembgcq7dj	cmuy06oxh00ahijze3rs9q8lg	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00thijzexnmqum1b	cmuy06p0u00alijze6e50xly7	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tiijzess3bjfph	cmuy06p4900apijze8ci2dwdg	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tjijzeicbhj6mu	cmuy06p7s00atijzemmwjz4gp	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tkijzei8q38usg	cmuy06pb600axijze3vopuazm	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tlijzemiwgvo1w	cmuy06pei00b1ijzee43k63t6	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tmijzexe3tp5c3	cmuy06phu00b5ijzemy0fodrt	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tnijze1dkx3tam	cmuy06pl800b9ijzeaoodi3ab	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00toijzewhj7m8ci	cmuy06puk00bfijze7mb1jip7	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tpijzec1dvxkqf	cmuy06py200bjijzec9u2rwaa	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tqijze63ttakae	cmuy06q1o00bnijzexjyaacm7	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00trijze386pc1ze	cmuy06q4y00brijzehynia9ou	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tsijzescste1w4	cmuy06q8c00bvijze3kdd0pa5	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ttijze5ih673js	cmuy06qbr00bzijze6xz5g5jr	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tuijze27o8zn2h	cmuy06qf800c3ijzepv65f19k	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tvijzesmszvz1v	cmuy06qiv00c7ijzesn7gvi12	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00twijzepat4ittm	cmuy06qm800cbijzezag69ydl	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00txijzeb91d4d3t	cmuy06qpn00cfijzedb2czkdf	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tyijzeec08ogl4	cmuy06qt600cjijzehrjkpz3w	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00tzijzehq8cera5	cmuy06qwj00cnijzevxud0ivj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u0ijzerhpfa7kl	cmuy06qzx00crijzefymr0ptw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u1ijzekd8gv4oy	cmuy06r3a00cvijzejt9dgzaq	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u2ijze9tc8s615	cmuy06r6q00czijzebzdfo6ym	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u3ijze09d0xl0q	cmuy06ra300d3ijze73v4vos8	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u4ijzezx5hsrs5	cmuy06rdf00d7ijze6d4pvaxm	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u5ijze4t69q48y	cmuy06rh800dbijzeczjejh57	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u6ijzec605trmc	cmuy06rko00dfijzeub1bqzr5	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u7ijze9gl0urwz	cmuy06ro100djijzegrfwyylj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u8ijzenkcipq8f	cmuy06rwl00dpijzege6lytd5	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00u9ijzepd54sb1d	cmuy06s0100dtijzem47dup7p	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uaijze397y5w08	cmuy06s3h00dxijze0hxr60zs	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ubijzev1dummc9	cmuy06s6w00e1ijzeqk7blje6	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ucijzek7lq2fo4	cmuy06sah00e5ijzei68cgmxm	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00udijze94hmjgsg	cmuy06sdv00e9ijzef6xen1qg	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ueijzejylrlue2	cmuy06sh900edijzegapw7euo	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ufijzeywxb8z26	cmuy06skp00ehijze6h4e0v3o	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ugijzepj61q389	cmuy06so200elijzeq8fsyc3q	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uhijzezkcp39qc	cmuy06sre00epijze8z1hh351	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uiijze0n51cx07	cmuy06suz00etijzeixin3eko	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ujijzee1fsyzz0	cmuy06syb00exijze7vehftwx	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ukijze0gfag7ff	cmuy06t1o00f1ijzey5kynmi1	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00ulijzee8fdpbin	cmuy06t5600f5ijzeuhj0ue3f	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00umijzenzjdb0km	cmuy06t8l00f9ijzevig1mrzu	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00unijzed4mfjd16	cmuy06tcc00fdijzenu9fmud8	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uoijzex3hxflls	cmuy06tfv00fhijze45fi0ss3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00upijzecwfc8vfx	cmuy06tja00flijzed4pgqi7a	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uqijze8ipqlcgv	cmuy06tms00fpijze5gzygr9h	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00urijzeoxj2q5jm	cmuy06tq900ftijzexrc0s2ka	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00usijzeufo6hnsa	cmuy06txq00fzijzew1qtbxel	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00utijze7eh0ixbc	cmuy06u1300g3ijzel3btvhnp	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uuijzers2dy29x	cmuy06u6n00g7ijzen551gttk	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uvijzeujo469xl	cmuy06ub900gbijzeef9wcknp	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uwijze231cu0gb	cmuy06ufu00gfijzeskjan5px	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uxijzeocnntqxp	cmuy06ujg00gjijzewhbd24p5	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uyijze2r8a0gi5	cmuy06una00gnijzexlhwtbgv	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00uzijzeyxoyp0ky	cmuy06usf00grijzeqkdfxqeh	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v0ijzenldb9qqr	cmuy06uw300gvijzevodg94j3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v1ijzexa3e3hqg	cmuy06uze00gzijzetlzkw38w	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v2ijze7po22jcp	cmuy06v2r00h3ijzetaruebi0	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v3ijzeb61bzgrk	cmuy06v6900h7ijzenusjw8o2	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v4ijzemboyebbf	cmuy06v9k00hbijzer6axwk5e	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v5ijzea69icnob	cmuy06vdm00hfijze5j8olqj3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v6ijze3jrj3g0x	cmuy06vh600hjijze89q6h68y	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v7ijzee8boyai9	cmuy06vkr00hnijze72s8ecpj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v8ijzex0oxm1n5	cmuy06vp000hrijzelejzalhs	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00v9ijzemipoqz36	cmuy06vsb00hvijze4dzbiuv8	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vaijze87ua3g3k	cmuy06vvq00hzijzeq7mjc0wi	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vbijzezpvng7kn	cmuy06vz700i3ijzebz95cnfw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vcijze6xmhhzmy	cmuy06w6n00i9ijze3v4f49ie	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vdijze7lv11ef3	cmuy06wa500idijze0ybcmvmb	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00veijzeot4xi9l5	cmuy06wdo00ihijzecxpbdkq1	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vfijze47vycm4o	cmuy06wh100ilijzedzjvmsdn	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vgijze00qopfcd	cmuy06wkg00ipijzenc9obvhb	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vhijzefw87i2n5	cmuy06wnu00itijzecca58dag	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00viijzeqlgzmn0j	cmuy06wrc00ixijzea0b4uxfj	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vjijzeo0glbsdt	cmuy06wuq00j1ijzezw2bdol5	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vkijzeqohr4knv	cmuy06wyb00j5ijzebdguel49	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vlijze3ta8xwr8	cmuy06x1u00j9ijzen4hd0xmv	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vmijzegcy1t65l	cmuy06x5b00jdijze9wrxzsee	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vnijzej0hu4tku	cmuy06x8r00jhijzeup9qad0q	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00voijzelu76tt6k	cmuy06xc500jlijzes6kmeoa2	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vpijze5g8f1o55	cmuy06xfq00jpijzel4b43w5m	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vqijzeqekpfl1w	cmuy06xj800jtijzeczibbtte	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vrijzev14p67xi	cmuy06xmn00jxijze0r9s8hmt	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vsijzegj00ikt0	cmuy06xq300k1ijzeq7nm3gcw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vtijze6pciap10	cmuy06xth00k5ijzei7iqeh8o	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vuijze7g4kgkfe	cmuy06xwu00k9ijzevfbwc6m6	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vvijzevryxhkeu	cmuy06y0800kdijzeik7pa3i6	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vwijze5v93f3ub	cmuy06y7k00kjijzeztdo9h6z	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vxijze50e3855z	cmuy06yb700knijze4lkwvz07	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vyijze9ve4h0qt	cmuy06yei00krijzeqq2jh7cb	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00vzijzee5vxfb8q	cmuy06yhz00kvijzeet33m9vh	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w0ijze94eneep2	cmuy06ylb00kzijze8vx5j528	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w1ijzehkkex8uw	cmuy06yop00l3ijzem7lotvle	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w2ijze5jtzp398	cmuy06ys300l7ijzexugobcb7	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w3ijze47z9bzht	cmuy06yvh00lbijzegrckln00	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w4ijzegkqks03d	cmuy06yyt00lfijze91dhhou1	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w5ijzeat8gx4f9	cmuy06z2800ljijzet5hnj0hn	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w6ijzep26pu2ix	cmuy06z5r00lnijzezqsvjdij	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w7ijzer58xwdtf	cmuy06z9p00lrijze0p9g8c22	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w8ijze5f9jocf4	cmuy06zd000lvijze6m8c3ib7	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00w9ijzet0sfbvmc	cmuy06zgc00lzijzeq4z9vm0m	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00waijze9rcjmtjh	cmuy06zjr00m3ijze6xct3g6e	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00wbijzesudylur5	cmuy06zn500m7ijzef2mg6cdw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00wcijzel3toiqfs	cmuy06zqf00mbijzedjqi9s4x	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00wdijzer55x1kdw	cmuy06zts00mfijze38l6thf3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00weijzefisfxt90	cmuy06zx500mjijzeb0hkm67y	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0b00wfijzegdhisdls	cmuy0700p00mnijze9lgc4mo2	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wgijzebrkwfbh9	cmuy0707r00mtijzevcki87de	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00whijzeznzqc2x3	cmuy070b600mxijzefuk6ajk3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wiijzeb4c2n7ef	cmuy070ek00n1ijzealmjsq4w	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wjijzecdhrl4bb	cmuy070hw00n5ijze4ai9wy6a	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wkijzet8lt3ld5	cmuy070lb00n9ijze70jberrt	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wlijzeov2drg45	cmuy070oo00ndijzeam7nesp3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wmijze4g2g1m41	cmuy070s200nhijze2t9t38vo	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wnijzehmky609c	cmuy070vk00nlijzebdwt8jql	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00woijzenk7e6egu	cmuy070yv00npijzeuf73sd9m	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wpijzegdj5x1lt	cmuy0712800ntijze72o8jroq	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wqijzebdf65ir3	cmuy0715k00nxijze8u2ly5ke	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wrijzemr5pzhuj	cmuy0719500o1ijze9mh101ti	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wsijzeubsyj028	cmuy071ck00o5ijzee8hddp9c	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wtijzepgfn03bp	cmuy071fx00o9ijzer4lw2hj3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wuijze31llcuc8	cmuy071j900odijzee6psr0zp	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wvijzeozxdm90u	cmuy071mp00ohijzelof2s519	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wwijze16n1uiap	cmuy071q300olijze3vgoyrhp	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wxijze59dfhlzk	cmuy071tn00opijze3dut94nr	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wyijze5h0zzbqw	cmuy071x100otijzel2cblwz3	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00wzijzebrrvdeu6	cmuy0720e00oxijze34adfphw	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x0ijzeexmxzapv	cmuy0729200p3ijze8lgm6zrr	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x1ijze8nwg0t70	cmuy072ch00p7ijzen8iqf27v	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x2ijzebtjo51hl	cmuy072g000pbijzeveo0bx4b	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x3ijze689eo9d3	cmuy072jc00pfijzev4lell37	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x4ijzea89csid3	cmuy072mo00pjijzehr4sxy1j	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x5ijzeqbbfubq7	cmuy072q700pnijze0crfwiiy	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x6ijze26yorcve	cmuy072tk00prijzewk4ptnih	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x7ijzegdnpivqy	cmuy072wz00pvijzeb3pz8z27	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x8ijzep7tafmpa	cmuy0730c00pzijzed0iu13wz	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00x9ijzeq4u9nlum	cmuy0734700q3ijzefds7pgn2	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00xaijzenggb06zh	cmuy0737l00q7ijze5vqxr793	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00xbijzezry3srxu	cmuy073ay00qbijzez9crfuvt	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00xcijzebtduzzau	cmuy073ec00qfijzeeldlav9e	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00xdijze51pyppsi	cmuy073ho00qjijzeh1iv85sm	2026-10	2000.00	PENDING	\N	\N	\N	\N
cmuy08e0c00xeijzemiknmkxh	cmuy073l100qnijzes4iw3l7h	2026-10	2000.00	PENDING	\N	\N	\N	\N
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, user_id, department, division_id, status, kta_number) FROM stdin;
cmux7oyhs0003ijkledx67jcm	cmux7oyhf0001ijklnupk4fez	\N	4	ACTIVE	025207
cmuxj1jr6000iijprsmbh597o	cmuxj1jr2000gijpr9z5eongf	\N	\N	ACTIVE	025204
cmuy06fcr0003ijzes21zxjhd	cmuy06fcd0001ijze772fsrpw	\N	\N	ACTIVE	026001
cmuy06fgm0007ijzeqhoejozq	cmuy06fgi0005ijze2wi51top	\N	\N	ACTIVE	026002
cmuy06fk9000bijzeqj6wtdu3	cmuy06fk60009ijzevzqpkwsl	\N	\N	ACTIVE	026003
cmuy06fnv000fijzerh9gkoux	cmuy06fnr000dijze3mge0kqa	\N	\N	ACTIVE	026004
cmuy06fre000jijze6yvzlsur	cmuy06fra000hijzegmydi6bo	\N	\N	ACTIVE	026005
cmuy06fv9000nijzev32nkl42	cmuy06fv5000lijzemdd1ox3a	\N	\N	ACTIVE	026006
cmuy06fzm000rijzeqi8ap7bx	cmuy06fzj000pijzefhd9mfc1	\N	\N	ACTIVE	026007
cmuy06g38000vijzexvn1txfh	cmuy06g34000tijze2nqc2t3l	\N	\N	ACTIVE	026008
cmuy06g72000zijzem3jq6lzt	cmuy06g6y000xijze9e8zb9mh	\N	\N	ACTIVE	026009
cmuy06gar0013ijzehv38lsb2	cmuy06gao0011ijze1p56wfaw	\N	\N	ACTIVE	026010
cmuy06geh0017ijze4w7kpsjp	cmuy06ged0015ijzeatezaz3r	\N	\N	ACTIVE	026011
cmuy06gi1001bijzegdf34pyx	cmuy06ghy0019ijzes3i4dtjv	\N	\N	ACTIVE	026012
cmuy06gll001fijzevklq0b75	cmuy06gli001dijzegkeqwree	\N	\N	ACTIVE	026013
cmuy06gpo001jijzezata9alo	cmuy06gpf001hijzecbw9sc9i	\N	\N	ACTIVE	026014
cmuy06gun001nijzeiaccyjrm	cmuy06guj001lijze16p7o9ry	\N	\N	ACTIVE	026015
cmuy06gy8001rijze2aw1x2f8	cmuy06gy5001pijze0cb6zz1i	\N	\N	ACTIVE	026016
cmuy06h1l001vijze6p2lyywd	cmuy06h1h001tijzey2mdi4v1	\N	\N	ACTIVE	026017
cmuy06h50001zijzehaozhz2j	cmuy06h4x001xijzedovf1efb	\N	\N	ACTIVE	026018
cmuy06h8d0023ijzeyhnzwnpp	cmuy06h8a0021ijzet8hwj3el	\N	\N	ACTIVE	026019
cmuy06hc50027ijzet4in719l	cmuy06hc20025ijze53togyfw	\N	\N	ACTIVE	026020
cmuy06hkp002dijzepe2szmgw	cmuy06hkm002bijzeuid357yj	\N	\N	ACTIVE	026021
cmuy06ho7002hijzeql2h37c8	cmuy06ho3002fijzeqrdr99zj	\N	\N	ACTIVE	026022
cmuy06hrp002lijzeu4xp9p7z	cmuy06hrm002jijzesf5wcgsk	\N	\N	ACTIVE	026023
cmuy06hv7002pijzexq6pwv0h	cmuy06hv3002nijzerv1o54fj	\N	\N	ACTIVE	026024
cmuy06hyn002tijzeqr9iltqr	cmuy06hyk002rijzegdk4urms	\N	\N	ACTIVE	026025
cmuy06i24002xijze2pwapody	cmuy06i21002vijzefdspwkrd	\N	\N	ACTIVE	026026
cmuy06i600031ijzeke1g0zkh	cmuy06i5p002zijzespj2pgbe	\N	\N	ACTIVE	026027
cmuy06ia30035ijzeqcfoe0ao	cmuy06i9z0033ijzexr0ojm8x	\N	\N	ACTIVE	026028
cmuy06idg0039ijze399v0j4y	cmuy06idd0037ijzen6hsb0u9	\N	\N	ACTIVE	026029
cmuy06igt003dijze9tsid89a	cmuy06igq003bijze9e35znp3	\N	\N	ACTIVE	026030
cmuy06ik5003hijzeiaspv3l2	cmuy06ik2003fijzegwarxl8m	\N	\N	ACTIVE	026031
cmuy06ink003lijze128e25b9	cmuy06inf003jijzepyiauwq3	\N	\N	ACTIVE	026032
cmuy06ir3003pijze2e0eb6v3	cmuy06ir0003nijzeq9vqist3	\N	\N	ACTIVE	026033
cmuy06iui003tijzep59h6il0	cmuy06iue003rijze24q9n6tw	\N	\N	ACTIVE	026034
cmuy06ixx003xijzec0jjf0eu	cmuy06ixu003vijze4hc8zfjs	\N	\N	ACTIVE	026035
cmuy06j1c0041ijze6i997mut	cmuy06j18003zijzeo599o42r	\N	\N	ACTIVE	026036
cmuy06j4q0045ijze9657l9l3	cmuy06j4n0043ijzetz46nk8n	\N	\N	ACTIVE	026037
cmuy06j820049ijze3yddbr8o	cmuy06j7z0047ijzejzrlk3k2	\N	\N	ACTIVE	026038
cmuy06jbf004dijzeu9fhtkug	cmuy06jbc004bijzeq9qxtrse	\N	\N	ACTIVE	026039
cmuy06jer004hijzezpl97evc	cmuy06jeo004fijzewdr8w3as	\N	\N	ACTIVE	026040
cmuy06jm7004nijzeijf74emb	cmuy06jm3004lijze1p7wih88	\N	\N	ACTIVE	026041
cmuy06jpt004rijzeyppgf5x6	cmuy06jpq004pijzejn20u965	\N	\N	ACTIVE	026042
cmuy06jtx004vijzezzilk2hu	cmuy06jtu004tijze0cjpq40k	\N	\N	ACTIVE	026043
cmuy06jx9004zijze3zhhwtp9	cmuy06jx6004xijzeox2m9gs7	\N	\N	ACTIVE	026044
cmuy06k0m0053ijzev6t69jjp	cmuy06k0i0051ijzerlqgm4ti	\N	\N	ACTIVE	026045
cmuy06k400057ijzewpc6oyha	cmuy06k3x0055ijzekq5f3wfz	\N	\N	ACTIVE	026046
cmuy06k7a005bijzeq3qnctd6	cmuy06k780059ijzeku9qhz9p	\N	\N	ACTIVE	026047
cmuy06kam005fijzeg3q9e8tp	cmuy06kaj005dijze2wu450m8	\N	\N	ACTIVE	026048
cmuy06ke7005jijzeyazexwkt	cmuy06ke4005hijzez6g9a8kc	\N	\N	ACTIVE	026049
cmuy06khj005nijzefwhae4d8	cmuy06khg005lijze8tjvaxix	\N	\N	ACTIVE	026050
cmuy06kl2005rijze1hnm5ii1	cmuy06kkz005pijzepr4wn4ok	\N	\N	ACTIVE	026051
cmuy06kof005vijzel9xajisl	cmuy06koc005tijzelvyr7n32	\N	\N	ACTIVE	026052
cmuy06krr005zijzerknmqgiu	cmuy06kro005xijzef8svw0t2	\N	\N	ACTIVE	026053
cmuy06kv30063ijzeijn331se	cmuy06kuz0061ijzew3cdmz15	\N	\N	ACTIVE	026054
cmuy06kyg0067ijzexxnsymk7	cmuy06kyd0065ijzehtrk9vvn	\N	\N	ACTIVE	026055
cmuy06l1w006bijzel26dcdf9	cmuy06l1t0069ijzeutxa1a31	\N	\N	ACTIVE	026056
cmuy06l5b006fijze0pj0usa5	cmuy06l56006dijzeddeay14u	\N	\N	ACTIVE	026057
cmuy06l8s006jijzeri638tzz	cmuy06l8o006hijze0pymhagj	\N	\N	ACTIVE	026058
cmuy06lca006nijze6sex6dyx	cmuy06lc6006lijzenmdopm2a	\N	\N	ACTIVE	026059
cmuy06lfz006rijzeniec2pts	cmuy06lfw006pijzel00zd2ph	\N	\N	ACTIVE	026060
cmuy06lnh006xijze32daglgo	cmuy06lnd006vijzen716ilsg	\N	\N	ACTIVE	026061
cmuy06lra0071ijzeuv6tjdg3	cmuy06lr7006zijze3chfohhw	\N	\N	ACTIVE	026062
cmuy06luv0075ijze2j3h3enk	cmuy06lus0073ijzeyqyv0nfl	\N	\N	ACTIVE	026063
cmuy06lyd0079ijzeyg18gjrg	cmuy06lya0077ijzetgyjnrog	\N	\N	ACTIVE	026064
cmuy06m22007dijze21gajupc	cmuy06m1z007bijze83bgp38w	\N	\N	ACTIVE	026065
cmuy06m5i007hijzewbu640wg	cmuy06m5e007fijzeonwf06zv	\N	\N	ACTIVE	026066
cmuy06m8w007lijzeor703u1q	cmuy06m8t007jijze2lkdjn8f	\N	\N	ACTIVE	026067
cmuy06mc8007pijzeuf4g26wp	cmuy06mc5007nijzejjepg4m5	\N	\N	ACTIVE	026068
cmuy06mfm007tijze8uc5veg4	cmuy06mfi007rijze70bdzc7o	\N	\N	ACTIVE	026069
cmuy06mj1007xijze9ffwa2z1	cmuy06miy007vijzea9pjo47l	\N	\N	ACTIVE	026070
cmuy06mmn0081ijzew0btjw17	cmuy06mmk007zijzeivp5r884	\N	\N	ACTIVE	026071
cmuy06mq50085ijze2cbz54sd	cmuy06mq20083ijzepdvf7ldj	\N	\N	ACTIVE	026072
cmuy06mto0089ijzemuzdm125	cmuy06mtl0087ijzez5kqw1vq	\N	\N	ACTIVE	026073
cmuy06mx9008dijzewwt3e22m	cmuy06mx6008bijzeg8b536ia	\N	\N	ACTIVE	026074
cmuy06n0n008hijze8ml60u12	cmuy06n0k008fijzefp3yf7fc	\N	\N	ACTIVE	026075
cmuy06n3w008lijze6p3jmwgg	cmuy06n3t008jijzed3bgkkeq	\N	\N	ACTIVE	026076
cmuy06n7d008pijzebqqi09ri	cmuy06n79008nijzektxymwra	\N	\N	ACTIVE	026077
cmuy06nap008tijzerpkw22ko	cmuy06nam008rijze7q0bnfgd	\N	\N	ACTIVE	026078
cmuy06ne2008xijze2hnaql6t	cmuy06ne0008vijzefwvwavg9	\N	\N	ACTIVE	026079
cmuy06nhh0091ijze5ew35xg8	cmuy06nhe008zijze3n4g1n0e	\N	\N	ACTIVE	026080
cmuy06nqd0097ijzei9650ia2	cmuy06nqa0095ijzexzly1zob	\N	\N	ACTIVE	026081
cmuy06nts009bijzegubeswp5	cmuy06ntp0099ijzemxvc41m4	\N	\N	ACTIVE	026082
cmuy06nx5009fijzetg0cdaxm	cmuy06nx1009dijzeyvn9nhvl	\N	\N	ACTIVE	026083
cmuy06o0s009jijzepclm25tv	cmuy06o0o009hijzennxj0ggt	\N	\N	ACTIVE	026084
cmuy06o47009nijzeesl4t1qu	cmuy06o43009lijzec6quqosf	\N	\N	ACTIVE	026085
cmuy06o80009rijzegfu15k8j	cmuy06o7w009pijzej1mwtc38	\N	\N	ACTIVE	026086
cmuy06obj009vijzehjq60e7a	cmuy06obf009tijzerw3jldyh	\N	\N	ACTIVE	026087
cmuy06oez009zijzehcans55k	cmuy06oew009xijze2dntbhmd	\N	\N	ACTIVE	026088
cmuy06oit00a3ijzefwsw8a3f	cmuy06oin00a1ijzeyxzau0xy	\N	\N	ACTIVE	026089
cmuy06on600a7ijzefmwa8oex	cmuy06on300a5ijzej3qxi1dy	\N	\N	ACTIVE	026090
cmuy06oqi00abijze7br9zugz	cmuy06oqf00a9ijze6xqo404q	\N	\N	ACTIVE	026091
cmuy06otz00afijzeprxcm1hf	cmuy06otv00adijzejzctn3c7	\N	\N	ACTIVE	026092
cmuy06oxk00ajijze1l2ha267	cmuy06oxh00ahijze3rs9q8lg	\N	\N	ACTIVE	026093
cmuy06p0y00anijzerk1b33vx	cmuy06p0u00alijze6e50xly7	\N	\N	ACTIVE	026094
cmuy06p4d00arijzen0xpv66t	cmuy06p4900apijze8ci2dwdg	\N	\N	ACTIVE	026095
cmuy06p7w00avijzev2ugfj2b	cmuy06p7s00atijzemmwjz4gp	\N	\N	ACTIVE	026096
cmuy06pb900azijzebmzyqtfm	cmuy06pb600axijze3vopuazm	\N	\N	ACTIVE	026097
cmuy06pel00b3ijzedjgj1wv8	cmuy06pei00b1ijzee43k63t6	\N	\N	ACTIVE	026098
cmuy06phx00b7ijzep3b9e3nw	cmuy06phu00b5ijzemy0fodrt	\N	\N	ACTIVE	026099
cmuy06plc00bbijzebt31oeep	cmuy06pl800b9ijzeaoodi3ab	\N	\N	ACTIVE	026100
cmuy06pup00bhijzexbwwxo61	cmuy06puk00bfijze7mb1jip7	\N	\N	ACTIVE	026101
cmuy06py500blijzeoa2mvevj	cmuy06py200bjijzec9u2rwaa	\N	\N	ACTIVE	026102
cmuy06q1r00bpijze9l46d8vl	cmuy06q1o00bnijzexjyaacm7	\N	\N	ACTIVE	026103
cmuy06q5100btijzeyo1m9d79	cmuy06q4y00brijzehynia9ou	\N	\N	ACTIVE	026104
cmuy06q8g00bxijzejf4a5b45	cmuy06q8c00bvijze3kdd0pa5	\N	\N	ACTIVE	026105
cmuy06qbu00c1ijze9a7eqmum	cmuy06qbr00bzijze6xz5g5jr	\N	\N	ACTIVE	026106
cmuy06qfc00c5ijzer4qbi7xr	cmuy06qf800c3ijzepv65f19k	\N	\N	ACTIVE	026107
cmuy06qiy00c9ijze9eb2x6yu	cmuy06qiv00c7ijzesn7gvi12	\N	\N	ACTIVE	026108
cmuy06qmb00cdijzeeyklbflf	cmuy06qm800cbijzezag69ydl	\N	\N	ACTIVE	026109
cmuy06qpq00chijzeydu3311z	cmuy06qpn00cfijzedb2czkdf	\N	\N	ACTIVE	026110
cmuy06qt900clijzeimee6vd5	cmuy06qt600cjijzehrjkpz3w	\N	\N	ACTIVE	026111
cmuy06qwm00cpijzejvj4fq4n	cmuy06qwj00cnijzevxud0ivj	\N	\N	ACTIVE	026112
cmuy06r0000ctijzez52r0utv	cmuy06qzx00crijzefymr0ptw	\N	\N	ACTIVE	026113
cmuy06r3e00cxijzel3q8t0mx	cmuy06r3a00cvijzejt9dgzaq	\N	\N	ACTIVE	026114
cmuy06r6s00d1ijze1kx8memn	cmuy06r6q00czijzebzdfo6ym	\N	\N	ACTIVE	026115
cmuy06ra600d5ijzek4alyk9z	cmuy06ra300d3ijze73v4vos8	\N	\N	ACTIVE	026116
cmuy06rdi00d9ijze37bg9qu5	cmuy06rdf00d7ijze6d4pvaxm	\N	\N	ACTIVE	026117
cmuy06rhd00ddijzeypib7kwh	cmuy06rh800dbijzeczjejh57	\N	\N	ACTIVE	026118
cmuy06rkt00dhijze43deoa3i	cmuy06rko00dfijzeub1bqzr5	\N	\N	ACTIVE	026119
cmuy06ro400dlijze5aryoemh	cmuy06ro100djijzegrfwyylj	\N	\N	ACTIVE	026120
cmuy06rwp00drijze2a93zy12	cmuy06rwl00dpijzege6lytd5	\N	\N	ACTIVE	026121
cmuy06s0400dvijze0ny5y49i	cmuy06s0100dtijzem47dup7p	\N	\N	ACTIVE	026122
cmuy06s3l00dzijzeg15wjjq4	cmuy06s3h00dxijze0hxr60zs	\N	\N	ACTIVE	026123
cmuy06s6z00e3ijzejmb6z688	cmuy06s6w00e1ijzeqk7blje6	\N	\N	ACTIVE	026124
cmuy06sal00e7ijzech5wa6n5	cmuy06sah00e5ijzei68cgmxm	\N	\N	ACTIVE	026125
cmuy06sdz00ebijze5rvqxf4v	cmuy06sdv00e9ijzef6xen1qg	\N	\N	ACTIVE	026126
cmuy06shc00efijze53qpvdzm	cmuy06sh900edijzegapw7euo	\N	\N	ACTIVE	026127
cmuy06sks00ejijzeszdqwijn	cmuy06skp00ehijze6h4e0v3o	\N	\N	ACTIVE	026128
cmuy06so500enijzejjaa0wcd	cmuy06so200elijzeq8fsyc3q	\N	\N	ACTIVE	026129
cmuy06srh00erijze4pf28q6o	cmuy06sre00epijze8z1hh351	\N	\N	ACTIVE	026130
cmuy06sv200evijzekvlc3hxd	cmuy06suz00etijzeixin3eko	\N	\N	ACTIVE	026131
cmuy06sye00ezijzeugti0nho	cmuy06syb00exijze7vehftwx	\N	\N	ACTIVE	026132
cmuy06t1s00f3ijzecauwxazz	cmuy06t1o00f1ijzey5kynmi1	\N	\N	ACTIVE	026133
cmuy06t5a00f7ijze8mkkeeqx	cmuy06t5600f5ijzeuhj0ue3f	\N	\N	ACTIVE	026134
cmuy06t8p00fbijzer742rk24	cmuy06t8l00f9ijzevig1mrzu	\N	\N	ACTIVE	026135
cmuy06tcf00ffijzeubxghe0o	cmuy06tcc00fdijzenu9fmud8	\N	\N	ACTIVE	026136
cmuy06tfy00fjijzewmjqw18s	cmuy06tfv00fhijze45fi0ss3	\N	\N	ACTIVE	026137
cmuy06tje00fnijzev7on1ltp	cmuy06tja00flijzed4pgqi7a	\N	\N	ACTIVE	026138
cmuy06tmv00frijzechcvvfr3	cmuy06tms00fpijze5gzygr9h	\N	\N	ACTIVE	026139
cmuy06tqc00fvijzepshashy4	cmuy06tq900ftijzexrc0s2ka	\N	\N	ACTIVE	026140
cmuy06txt00g1ijzeij2lxe8f	cmuy06txq00fzijzew1qtbxel	\N	\N	ACTIVE	026141
cmuy06u1700g5ijzedcc71du7	cmuy06u1300g3ijzel3btvhnp	\N	\N	ACTIVE	026142
cmuy06u6r00g9ijzevvjifnya	cmuy06u6n00g7ijzen551gttk	\N	\N	ACTIVE	026143
cmuy06ubc00gdijze6knyc31e	cmuy06ub900gbijzeef9wcknp	\N	\N	ACTIVE	026144
cmuy06ufy00ghijze6e05r1k7	cmuy06ufu00gfijzeskjan5px	\N	\N	ACTIVE	026145
cmuy06ujl00glijzeyu5w1ost	cmuy06ujg00gjijzewhbd24p5	\N	\N	ACTIVE	026146
cmuy06une00gpijzecyn8mqik	cmuy06una00gnijzexlhwtbgv	\N	\N	ACTIVE	026147
cmuy06usi00gtijze942u8d7l	cmuy06usf00grijzeqkdfxqeh	\N	\N	ACTIVE	026148
cmuy06uw600gxijzea4lojqz2	cmuy06uw300gvijzevodg94j3	\N	\N	ACTIVE	026149
cmuy06uzh00h1ijze5quztsy4	cmuy06uze00gzijzetlzkw38w	\N	\N	ACTIVE	026150
cmuy06v2v00h5ijzewrusvag9	cmuy06v2r00h3ijzetaruebi0	\N	\N	ACTIVE	026151
cmuy06v6c00h9ijzeol050b6u	cmuy06v6900h7ijzenusjw8o2	\N	\N	ACTIVE	026152
cmuy06v9n00hdijzeavyhd10f	cmuy06v9k00hbijzer6axwk5e	\N	\N	ACTIVE	026153
cmuy06vds00hhijze735n6lye	cmuy06vdm00hfijze5j8olqj3	\N	\N	ACTIVE	026154
cmuy06vha00hlijzeii78ypwr	cmuy06vh600hjijze89q6h68y	\N	\N	ACTIVE	026155
cmuy06vkx00hpijze0hwjya52	cmuy06vkr00hnijze72s8ecpj	\N	\N	ACTIVE	026156
cmuy06vp300htijzej4ys4i7k	cmuy06vp000hrijzelejzalhs	\N	\N	ACTIVE	026157
cmuy06vse00hxijzeukqe5frt	cmuy06vsb00hvijze4dzbiuv8	\N	\N	ACTIVE	026158
cmuy06vvt00i1ijzelsgjdn8f	cmuy06vvq00hzijzeq7mjc0wi	\N	\N	ACTIVE	026159
cmuy06vza00i5ijzeltsnuwyk	cmuy06vz700i3ijzebz95cnfw	\N	\N	ACTIVE	026160
cmuy06w6q00ibijze2fyjyagb	cmuy06w6n00i9ijze3v4f49ie	\N	\N	ACTIVE	026161
cmuy06wa900ifijze88aq3hok	cmuy06wa500idijze0ybcmvmb	\N	\N	ACTIVE	026162
cmuy06wdr00ijijzec5tkd4y4	cmuy06wdo00ihijzecxpbdkq1	\N	\N	ACTIVE	026163
cmuy06wh500inijzeqbbwlpsu	cmuy06wh100ilijzedzjvmsdn	\N	\N	ACTIVE	026164
cmuy06wkj00irijzel8j9d96u	cmuy06wkg00ipijzenc9obvhb	\N	\N	ACTIVE	026165
cmuy06wnx00ivijze9akx6wus	cmuy06wnu00itijzecca58dag	\N	\N	ACTIVE	026166
cmuy06wrf00izijzebb7pl8wn	cmuy06wrc00ixijzea0b4uxfj	\N	\N	ACTIVE	026167
cmuy06wut00j3ijze098l1yuu	cmuy06wuq00j1ijzezw2bdol5	\N	\N	ACTIVE	026168
cmuy06wyf00j7ijzeq70euwbs	cmuy06wyb00j5ijzebdguel49	\N	\N	ACTIVE	026169
cmuy06x1y00jbijzeuxafuf0z	cmuy06x1u00j9ijzen4hd0xmv	\N	\N	ACTIVE	026170
cmuy06x5e00jfijzepwetowid	cmuy06x5b00jdijze9wrxzsee	\N	\N	ACTIVE	026171
cmuy06x8u00jjijze8fe747al	cmuy06x8r00jhijzeup9qad0q	\N	\N	ACTIVE	026172
cmuy06xc800jnijzednlmkpe4	cmuy06xc500jlijzes6kmeoa2	\N	\N	ACTIVE	026173
cmuy06xft00jrijze0f1q692d	cmuy06xfq00jpijzel4b43w5m	\N	\N	ACTIVE	026174
cmuy06xjb00jvijzed99iag2k	cmuy06xj800jtijzeczibbtte	\N	\N	ACTIVE	026175
cmuy06xmq00jzijzejp5lqqvz	cmuy06xmn00jxijze0r9s8hmt	\N	\N	ACTIVE	026176
cmuy06xq600k3ijzeohapxstd	cmuy06xq300k1ijzeq7nm3gcw	\N	\N	ACTIVE	026177
cmuy06xtl00k7ijzegpj1yhqj	cmuy06xth00k5ijzei7iqeh8o	\N	\N	ACTIVE	026178
cmuy06xwx00kbijzetuueff5m	cmuy06xwu00k9ijzevfbwc6m6	\N	\N	ACTIVE	026179
cmuy06y0b00kfijze3sv99ico	cmuy06y0800kdijzeik7pa3i6	\N	\N	ACTIVE	026180
cmuy06y7p00klijzet0mt3c8b	cmuy06y7k00kjijzeztdo9h6z	\N	\N	ACTIVE	026181
cmuy06yba00kpijzezjdhv2x5	cmuy06yb700knijze4lkwvz07	\N	\N	ACTIVE	026182
cmuy06yem00ktijzen90fj3k7	cmuy06yei00krijzeqq2jh7cb	\N	\N	ACTIVE	026183
cmuy06yi300kxijzedeeit0xn	cmuy06yhz00kvijzeet33m9vh	\N	\N	ACTIVE	026184
cmuy06ylf00l1ijze3kv3t9wl	cmuy06ylb00kzijze8vx5j528	\N	\N	ACTIVE	026185
cmuy06yot00l5ijzerp5rbkhk	cmuy06yop00l3ijzem7lotvle	\N	\N	ACTIVE	026186
cmuy06ys600l9ijzelasyt5ih	cmuy06ys300l7ijzexugobcb7	\N	\N	ACTIVE	026187
cmuy06yvk00ldijzeklznyg7f	cmuy06yvh00lbijzegrckln00	\N	\N	ACTIVE	026188
cmuy06yyw00lhijze3sdfh1o6	cmuy06yyt00lfijze91dhhou1	\N	\N	ACTIVE	026189
cmuy06z2b00llijzeapxgik8b	cmuy06z2800ljijzet5hnj0hn	\N	\N	ACTIVE	026190
cmuy06z5w00lpijzebuyne1x3	cmuy06z5r00lnijzezqsvjdij	\N	\N	ACTIVE	026191
cmuy06z9s00ltijzeqo4agzhu	cmuy06z9p00lrijze0p9g8c22	\N	\N	ACTIVE	026192
cmuy06zd300lxijzer2954xph	cmuy06zd000lvijze6m8c3ib7	\N	\N	ACTIVE	026193
cmuy06zgf00m1ijze07cfgp6t	cmuy06zgc00lzijzeq4z9vm0m	\N	\N	ACTIVE	026194
cmuy06zju00m5ijzeh3zfbfnf	cmuy06zjr00m3ijze6xct3g6e	\N	\N	ACTIVE	026195
cmuy06zn800m9ijzehegdo26b	cmuy06zn500m7ijzef2mg6cdw	\N	\N	ACTIVE	026196
cmuy06zqi00mdijzeh1w4mltn	cmuy06zqf00mbijzedjqi9s4x	\N	\N	ACTIVE	026197
cmuy06ztv00mhijze3jd8e98m	cmuy06zts00mfijze38l6thf3	\N	\N	ACTIVE	026198
cmuy06zx800mlijze62dou98q	cmuy06zx500mjijzeb0hkm67y	\N	\N	ACTIVE	026199
cmuy0700s00mpijze4c5unn1p	cmuy0700p00mnijze9lgc4mo2	\N	\N	ACTIVE	026200
cmuy0707v00mvijze0wey3nk5	cmuy0707r00mtijzevcki87de	\N	\N	ACTIVE	026201
cmuy070b900mzijzegjw7uw9m	cmuy070b600mxijzefuk6ajk3	\N	\N	ACTIVE	026202
cmuy070en00n3ijzer8l5gdc9	cmuy070ek00n1ijzealmjsq4w	\N	\N	ACTIVE	026203
cmuy070i000n7ijze6vosgc2n	cmuy070hw00n5ijze4ai9wy6a	\N	\N	ACTIVE	026204
cmuy070le00nbijze48cjnbh9	cmuy070lb00n9ijze70jberrt	\N	\N	ACTIVE	026205
cmuy070or00nfijzelmaurowt	cmuy070oo00ndijzeam7nesp3	\N	\N	ACTIVE	026206
cmuy070s500njijze3dchjr2c	cmuy070s200nhijze2t9t38vo	\N	\N	ACTIVE	026207
cmuy070vn00nnijzeyqtpeu0q	cmuy070vk00nlijzebdwt8jql	\N	\N	ACTIVE	026208
cmuy070yy00nrijze6nrdc8m5	cmuy070yv00npijzeuf73sd9m	\N	\N	ACTIVE	026209
cmuy0712c00nvijzeb5xt6iut	cmuy0712800ntijze72o8jroq	\N	\N	ACTIVE	026210
cmuy0715n00nzijze6vwpenhc	cmuy0715k00nxijze8u2ly5ke	\N	\N	ACTIVE	026211
cmuy0719900o3ijze43p7sreb	cmuy0719500o1ijze9mh101ti	\N	\N	ACTIVE	026212
cmuy071cn00o7ijzefz8yq9ni	cmuy071ck00o5ijzee8hddp9c	\N	\N	ACTIVE	026213
cmuy071g000obijze7npp63t6	cmuy071fx00o9ijzer4lw2hj3	\N	\N	ACTIVE	026214
cmuy071jc00ofijzeq3ukb3sx	cmuy071j900odijzee6psr0zp	\N	\N	ACTIVE	026215
cmuy071mt00ojijze5w9m1jtj	cmuy071mp00ohijzelof2s519	\N	\N	ACTIVE	026216
cmuy071qb00onijzeilcclubc	cmuy071q300olijze3vgoyrhp	\N	\N	ACTIVE	026217
cmuy071tq00orijzeslt0gt6l	cmuy071tn00opijze3dut94nr	\N	\N	ACTIVE	026218
cmuy071x500ovijze9nxidrsv	cmuy071x100otijzel2cblwz3	\N	\N	ACTIVE	026219
cmuy0720h00ozijzej5h2gir4	cmuy0720e00oxijze34adfphw	\N	\N	ACTIVE	026220
cmuy0729500p5ijze5hr3cirh	cmuy0729200p3ijze8lgm6zrr	\N	\N	ACTIVE	026221
cmuy072cm00p9ijzeecp6l164	cmuy072ch00p7ijzen8iqf27v	\N	\N	ACTIVE	026222
cmuy072g300pdijzem4vvr9nj	cmuy072g000pbijzeveo0bx4b	\N	\N	ACTIVE	026223
cmuy072jf00phijze9cb15jzu	cmuy072jc00pfijzev4lell37	\N	\N	ACTIVE	026224
cmuy072mr00plijzekqzp7t5r	cmuy072mo00pjijzehr4sxy1j	\N	\N	ACTIVE	026225
cmuy072q900ppijzebaz10v2e	cmuy072q700pnijze0crfwiiy	\N	\N	ACTIVE	026226
cmuy072to00ptijzehefelu2y	cmuy072tk00prijzewk4ptnih	\N	\N	ACTIVE	026227
cmuy072x200pxijzeyf1w1b25	cmuy072wz00pvijzeb3pz8z27	\N	\N	ACTIVE	026228
cmuy0730g00q1ijzevxi4i7sq	cmuy0730c00pzijzed0iu13wz	\N	\N	ACTIVE	026229
cmuy0734a00q5ijzejghwfm6e	cmuy0734700q3ijzefds7pgn2	\N	\N	ACTIVE	026230
cmuy0737o00q9ijze9utl92c5	cmuy0737l00q7ijze5vqxr793	\N	\N	ACTIVE	026231
cmuy073b100qdijzebjf6p8fz	cmuy073ay00qbijzez9crfuvt	\N	\N	ACTIVE	026232
cmuy073ef00qhijze4j0yf50v	cmuy073ec00qfijzeeldlav9e	\N	\N	ACTIVE	026233
cmuy073hs00qlijzere3jij16	cmuy073ho00qjijzeh1iv85sm	\N	\N	ACTIVE	026234
cmuy073l400qpijzenb7t1h7z	cmuy073l100qnijzes4iw3l7h	\N	\N	ACTIVE	026235
\.


--
-- Data for Name: official_letters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.official_letters (id, letter_number, type, subject, sender_receiver, document_url, created_at, activity_name, forwarded_at, kind, letter_date, nature, received_at, summary, campus_funds, signed_by, event_id) FROM stdin;
cmuxlf0l00000ijw4a7brbpbk	001/PROP/HIMMAN/UKRI/X/2026	PROPOSAL	Proposal Seminar Workshop KTI	Yth. Wakil Rektor III Bidang Kemahasiswaan dan Alumni	\N	2026-10-07 04:13:56.532	\N	\N	\N	2026-10-07 04:13:56.532	\N	\N	\N	f	{KETUA_PELAKSANA,SEKRETARIS_KEGIATAN,KETUA_HIMPUNAN}	\N
\.


--
-- Data for Name: org_officers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_officers (id, "position", user_id, name, created_at, signature_url) FROM stdin;
1	CHAIR	cmux7oyhf0001ijklnupk4fez	Muhammad Faris Febrian Ramdan	2026-10-13 04:15:35.311	\N
2	VICE_CHAIR	cmuxj1jr2000gijpr9z5eongf	Ubadurahman Nurdzaky	2026-10-13 04:15:38.569	\N
3	SECRETARY	\N	Sri Aprilia Karunia Putri	2026-10-13 04:16:51.457	/api/signatures/f8a7d7de-0cfb-4b4b-80b8-fe1fbd4c7bdc.png
4	TREASURER	\N	Meizela	2026-10-13 04:16:53.63	/api/signatures/7a3e11fa-d58b-4128-afe7-da4f3c90c8a4.png
5	DEAN	\N	Dr.Hj.R.Dewi Pertiwi. Se.MM.CMA	2026-10-13 04:21:52.199	/api/signatures/1af95a03-e7a0-45ba-a229-3331460a6c63.png
6	PRODI_HEAD	\N	Deri Apriadi S.E.MM	2026-10-13 04:23:04.079	\N
7	ADVISOR	\N	Dadar Supriatna S.E.MM	2026-10-13 04:23:57.566	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, code, description) FROM stdin;
1	cms:write	\N
2	finance:read	\N
3	finance:write	\N
4	event:manage	\N
5	secretariat:manage	\N
6	member:manage	\N
\.


--
-- Data for Name: rate_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rate_limits (key, count, window_start) FROM stdin;
5edd1c74ec0bbcd1ecb87cb1aef7a515d7d793b336c41f85c91e3a1c621b43d9	1	2026-10-12 06:18:48.557+00
6acdb14efa284514d313c7cf62bfd78c773043e82c1b2db91211a6c011e4a0b9	1	2026-10-10 02:15:52.752+00
f644abb82ec2a9e5dcd2954703aa09441bc407193ccccf59d8988969f54a1f71	1	2026-10-12 06:18:48.561+00
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, title, description, category, url, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions ("roleId", "permissionId") FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description) FROM stdin;
1	SUPER_ADMIN	\N
2	ADMIN_EXECUTIVE	\N
3	MEMBER	\N
4	ALUMNI	\N
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions ("userId", "permissionId") FROM stdin;
cmuxj1jr2000gijpr9z5eongf	1
cmuxj1jr2000gijpr9z5eongf	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nim, full_name, email, password_hash, role_id, approval_status, avatar_url, phone_number, batch_year, created_at, updated_at, signature_url) FROM stdin;
cmuy06i5p002zijzespj2pgbe	20261610027	Restu Muhamad Al Basit	20261610027@mahasiswa.himman.local	$2b$10$SFhfSb3KTljt.5i4eNXOEeQUy/fPAjlZTlp5l8AJDp8gmBrnfeHLS	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.645	2026-10-07 11:07:13.645	\N
cmux7oyhf0001ijklnupk4fez	20251610207	Muhammad Faris Febrian Ramdan	farisfebrian0602@gmail.com	$2b$12$bOKeWxb2.QQM8vv.12iXweOzVi5J2E0i5Zb4OV/pa4rf3Q65vjuxS	1	APPROVED	\N	085860675228	2025	2026-10-06 21:49:45.747	2026-10-07 03:51:04.536	\N
cmuy06i9z0033ijzexr0ojm8x	20261610028	Rifha Pradipta Hidayat	20261610028@mahasiswa.himman.local	$2b$10$04bTtEJ9nit2I.zO80wbp.8CnUgHlBRbhnZeX0m20XyOZywBLNcSi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.8	2026-10-07 11:07:13.8	\N
cmuy06idd0037ijzen6hsb0u9	20261610029	Abdul Azis	20261610029@mahasiswa.himman.local	$2b$10$LMFGEh9pHoQzxpfA2wgpz.GHsMslxtaCWcIXcidbWb5dPPNXOWzKK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.921	2026-10-07 11:07:13.921	\N
cmuy06fcd0001ijze772fsrpw	20261610001	Alifa Bilbina Nur Zakia	20261610001@mahasiswa.himman.local	$2b$10$7FTa/Cs5VlAAKmpc8gBQoup44n8ZS0weNO0LOLPN6dkSgK.calzZu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:09.997	2026-10-07 11:07:09.997	\N
cmuy06fgi0005ijze2wi51top	20261610002	Andriansyah	20261610002@mahasiswa.himman.local	$2b$10$rRCZDr8Tpf.MPKKgsRR8PuzdyHwHMAe6MwApcQ47sqsYsUauvho3W	3	APPROVED	\N	\N	2026	2026-10-07 11:07:10.146	2026-10-07 11:07:10.146	\N
cmuy06fk60009ijzevzqpkwsl	20261610003	Ayleena Issaura Gunawan	20261610003@mahasiswa.himman.local	$2b$10$xHaxbTE30vO48pkRue.JcezrxhAG9J4yXljOhubBisGb8HlBp3HP.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:10.278	2026-10-07 11:07:10.278	\N
cmuy06fnr000dijze3mge0kqa	20261610004	Hani Dewi Balqist	20261610004@mahasiswa.himman.local	$2b$10$ykFp.bfW/eMTIATV4MNlyOp3MjHq0aTruA.vQ8ZltAUfM70ekuwY.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:10.408	2026-10-07 11:07:10.408	\N
cmuy06fra000hijzegmydi6bo	20261610005	Decha Maharani	20261610005@mahasiswa.himman.local	$2b$10$ABxGP9AQIPRvu.Xno1xF/uFCQQw5eilf04ifkyItKiZJK6Se0ZoJ.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:10.535	2026-10-07 11:07:10.535	\N
cmuy06fv5000lijzemdd1ox3a	20261610006	Dzulfadhilah Mardhiyyah	20261610006@mahasiswa.himman.local	$2b$10$W74vc3DBpxkMPwwYSzXPq.pj./L0trVUchrroxLEJVSSBwTMfG4pG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:10.673	2026-10-07 11:07:10.673	\N
cmuy06fzj000pijzefhd9mfc1	20261610007	Elliza Wiranti Kusumah	20261610007@mahasiswa.himman.local	$2b$10$whAM.1VhWb7rhkrabfpTjO9KscbIALz3mTyl7FcoKoczrgSMMHR1q	3	APPROVED	\N	\N	2026	2026-10-07 11:07:10.831	2026-10-07 11:07:10.831	\N
cmuy06g34000tijze2nqc2t3l	20261610008	Fariz Silmi Aryatama	20261610008@mahasiswa.himman.local	$2b$10$W/c9tXj8kVvsjaIhTLZi/.Z5Y/rYb8oa1JyKopjYGY05oosuqvz7q	3	APPROVED	\N	\N	2026	2026-10-07 11:07:10.961	2026-10-07 11:07:10.961	\N
cmuy06g6y000xijze9e8zb9mh	20261610009	Indhiera Marchelianti	20261610009@mahasiswa.himman.local	$2b$10$K.hVuK4a2PdReNO1AvxAMupcsDMj7JG8aG8faJPki1eB.9Q1P9D7C	3	APPROVED	\N	\N	2026	2026-10-07 11:07:11.099	2026-10-07 11:07:11.099	\N
cmuy06gao0011ijze1p56wfaw	20261610010	Indira Anjani Putri	20261610010@mahasiswa.himman.local	$2b$10$JE8hBdmrOgAFbqh/AbOhHuPr6nO7VRlKaF4j/0EmdBe/ZAuz/qYNy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:11.232	2026-10-07 11:07:11.232	\N
cmuy06ged0015ijzeatezaz3r	20261610011	Inka Riana Rahmah	20261610011@mahasiswa.himman.local	$2b$10$EcVuAt/Q2vpQ0WjfwJhDVuTxjW/4fMZuKeVjHjajJpICfn9R.G9aO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:11.366	2026-10-07 11:07:11.366	\N
cmuy06ghy0019ijzes3i4dtjv	20261610012	Keysha Nawla Rizkia	20261610012@mahasiswa.himman.local	$2b$10$/re8tcVjUZmNojSm3rxAB.QfNTi4ppyWx1GuVF0qCx/tfuoONV8Da	3	APPROVED	\N	\N	2026	2026-10-07 11:07:11.494	2026-10-07 11:07:11.494	\N
cmuy06gli001dijzegkeqwree	20261610013	Kirania Intan Sudrajat	20261610013@mahasiswa.himman.local	$2b$10$Wacb/IKozBhA8GVeDPimu.Ntj.rrTul55B9lCWMqxaifAr9uhOMAC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:11.622	2026-10-07 11:07:11.622	\N
cmuy06gpf001hijzecbw9sc9i	20261610014	Mika Nurlaela	20261610014@mahasiswa.himman.local	$2b$10$98lsAv/iWv9z3qhclGid8ecG5ATj6uyM3MATWWq7RA3plfYxhQTtW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:11.764	2026-10-07 11:07:11.764	\N
cmuy06guj001lijze16p7o9ry	20261610015	Najma Nayira	20261610015@mahasiswa.himman.local	$2b$10$kL0vhHupS8Mf1nymDhymMOupeG1OPEUV9Pt8UPfR/KnTZoHkEbSfG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:11.947	2026-10-07 11:07:11.947	\N
cmuy06gy5001pijze0cb6zz1i	20261610016	Rani Riyani	20261610016@mahasiswa.himman.local	$2b$10$6sESrY8QRAAY4OjTyqZJjOAby/jDxTpLM1dMZTTJKiR3zd53oN5sK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:12.077	2026-10-07 11:07:12.077	\N
cmuy06h1h001tijzey2mdi4v1	20261610017	Rendi Andi Hermawan	20261610017@mahasiswa.himman.local	$2b$10$jfaqCRHE1dRfeX2M5BtzA.Y4SZzdcxuRd2Oi.ow9BnFsWD2ul62n6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:12.197	2026-10-07 11:07:12.197	\N
cmuy06h4x001xijzedovf1efb	20261610018	Rhena Hanifah Azzahra	20261610018@mahasiswa.himman.local	$2b$10$i4R.FGRxGA3kKaeyvzDF1unWx0jPkcc4yitwPiQmyHnw9J7S8.iL6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:12.322	2026-10-07 11:07:12.322	\N
cmuy06h8a0021ijzet8hwj3el	20261610019	Rizki Ramdani	20261610019@mahasiswa.himman.local	$2b$10$ePYmqRuSYTsisAT9oEE82ewO2kEYG/NBsp4UzUrDCWAWyvHM33lcy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:12.442	2026-10-07 11:07:12.442	\N
cmuy06hc20025ijze53togyfw	20261610020	Sidny Aurelia Safitri	20261610020@mahasiswa.himman.local	$2b$10$wheoF7r/MycLZ2Fhje30ouuvjnaOGnj9wN02SpLwwO8E0Mg60XL/e	3	APPROVED	\N	\N	2026	2026-10-07 11:07:12.579	2026-10-07 11:07:12.579	\N
cmuy06hkm002bijzeuid357yj	20261610021	Silvi Silvia	20261610021@mahasiswa.himman.local	$2b$10$JLLFF518qZ5t7cPgYl27beC6NtZOIQ7GomP2jlw78I6NISTJ/8f/C	3	APPROVED	\N	\N	2026	2026-10-07 11:07:12.886	2026-10-07 11:07:12.886	\N
cmuy06ho3002fijzeqrdr99zj	20261610022	Taskia Anggraena	20261610022@mahasiswa.himman.local	$2b$10$ycNngO8ubiC2Beq.FndT8O6XaPPeeJwznR8y/ZrHSua5rI3trOG7.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.012	2026-10-07 11:07:13.012	\N
cmuy06hrm002jijzesf5wcgsk	20261610023	Zahra Milana Fazrin	20261610023@mahasiswa.himman.local	$2b$10$YZaE8qs2p/o0QzmBB6ysDul9J3kc2uHMqYeMOe.sFO4APmhdRTSfO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.138	2026-10-07 11:07:13.138	\N
cmuy06hv3002nijzerv1o54fj	20261610024	Zaskia Anggraeni	20261610024@mahasiswa.himman.local	$2b$10$QrtT82p/07K1Ty2yn9I09eAl78JFHP31.VW/LGu5VTVFvibDpGeJy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.264	2026-10-07 11:07:13.264	\N
cmuy06hyk002rijzegdk4urms	20261610025	Muhamad Lukman Nul Hakim	20261610025@mahasiswa.himman.local	$2b$10$vDajM4NYxPgtSFfAPr9i0eMz5/vWwIRkI6.9vPHQP7KmyDkp.ts86	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.388	2026-10-07 11:07:13.388	\N
cmuy06i21002vijzefdspwkrd	20261610026	Muhammad Rasya Utama	20261610026@mahasiswa.himman.local	$2b$10$2CJKO0Vwe3Rya/SdAkAAUe/XWhYsTsBICuFtdfb92vMD.axeEyqM6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:13.513	2026-10-07 11:07:13.513	\N
cmuy06igq003bijze9e35znp3	20261610030	Risma Triyani	20261610030@mahasiswa.himman.local	$2b$10$Y3l.8WC1Gd.Md5/kaOkgJuVbEOLg2nuH3tn0bW3MR5QnCKk18tjGO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.043	2026-10-07 11:07:14.043	\N
cmuy06ik2003fijzegwarxl8m	20261610031	Firli Hasan	20261610031@mahasiswa.himman.local	$2b$10$xEsju6zy7GX/t1aPDdF2ieojopHNnkvpXKGKHFzwM8XdW9hWewgn2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.162	2026-10-07 11:07:14.162	\N
cmuy06inf003jijzepyiauwq3	20261610032	Vita Vitri Jelita	20261610032@mahasiswa.himman.local	$2b$10$A1PCShRHUTSgVT9bKVcspeNkakje41GjSeMPdfAdjYqDIe4UxscEu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.283	2026-10-07 11:07:14.283	\N
cmuy06ir0003nijzeq9vqist3	20261610033	Syifa Aulia	20261610033@mahasiswa.himman.local	$2b$10$9fHl60WI7UX1fZxgyjiq..xcobrb928DHtP4L6FxACFn9HE7m0bhG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.412	2026-10-07 11:07:14.412	\N
cmuy06iue003rijze24q9n6tw	20261610034	Dalvi Setia Gumilar	20261610034@mahasiswa.himman.local	$2b$10$yBSEqb8by2tVzq66D1PUxO5dFfw5Df5300zJiBHFXY32AVWMFm4Ke	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.535	2026-10-07 11:07:14.535	\N
cmuy06ixu003vijze4hc8zfjs	20261610035	Sri Nur Aisyah	20261610035@mahasiswa.himman.local	$2b$10$I2sFqlHi3/d04Z5gV5HlXexds7cu8jsHlq9ezMWon/UdiJUoAlmxy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.658	2026-10-07 11:07:14.658	\N
cmuy06j18003zijzeo599o42r	20261610036	Rayhan Naufal Akbar	20261610036@mahasiswa.himman.local	$2b$10$eGPgJ1sF8lpnG66bNvCSb.GAzp5ldAEdcPRaEx58KhnSkZ3tClOli	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.781	2026-10-07 11:07:14.781	\N
cmuy06j4n0043ijzetz46nk8n	20261610037	Muhammad Alfriezas	20261610037@mahasiswa.himman.local	$2b$10$gNbnNhbBkrDLXuoJFB3KYeanKyNegTM9kZPq4nwjjqwMnyjJOtH6S	3	APPROVED	\N	\N	2026	2026-10-07 11:07:14.903	2026-10-07 11:07:14.903	\N
cmuy06j7z0047ijzejzrlk3k2	20261610038	Silviya Bilqis Shafitri	20261610038@mahasiswa.himman.local	$2b$10$sPxN7w0UQKy9UZiD.HvO2uMc9mgRnAGLMVxnBoopx81lburIreTj6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:15.023	2026-10-07 11:07:15.023	\N
cmuy06jbc004bijzeq9qxtrse	20261610039	Felia Metamori	20261610039@mahasiswa.himman.local	$2b$10$ckJSJkoEcJSnzmKzSU.6zuejMNsvn4Td.DRTF/7khxG0s07svq99W	3	APPROVED	\N	\N	2026	2026-10-07 11:07:15.144	2026-10-07 11:07:15.144	\N
cmuy06jeo004fijzewdr8w3as	20261610040	Elniar Rheina Nur'afni	20261610040@mahasiswa.himman.local	$2b$10$U/I7wYqdQ5c1ULKRxBoAMekkXDdFzRESw3diV5VJSTVrAdyST2VHe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:15.264	2026-10-07 11:07:15.264	\N
cmuy06jm3004lijze1p7wih88	20261610041	Siti Widaningsih	20261610041@mahasiswa.himman.local	$2b$10$nQ1oyKD8ZQUiINiuOXr0cOAiAuzqw7zVm8wVi0w8p9RdqsH4NF.TW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:15.531	2026-10-07 11:07:15.531	\N
cmuy06jpq004pijzejn20u965	20261610042	M. Sauqi Hamdani Qodarul Ula	20261610042@mahasiswa.himman.local	$2b$10$KA3hCpPOdPpw7.o68ohWj.Q5WKm/H8e2pfiIA3F9aheFrfEm7KB5G	3	APPROVED	\N	\N	2026	2026-10-07 11:07:15.662	2026-10-07 11:07:15.662	\N
cmuy06jtu004tijze0cjpq40k	20261610043	Elpan Setiawan	20261610043@mahasiswa.himman.local	$2b$10$qvFgmPWK1.wRNy2ygWvy1eNGcWdFdmJqrbhIOGWMmBzhJaUA5eeFO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:15.811	2026-10-07 11:07:15.811	\N
cmuy06jx6004xijzeox2m9gs7	20261610044	Rio Revian	20261610044@mahasiswa.himman.local	$2b$10$ppeqpbiJHjp1WxFBaaO.MOSycOG8HkuPpTFvWPhKRR3OqtOS4ECEe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:15.931	2026-10-07 11:07:15.931	\N
cmuy06k0i0051ijzerlqgm4ti	20261610045	Rivaldy Bagus Setiawan	20261610045@mahasiswa.himman.local	$2b$10$MTb7oKxVwrO9iVQC6p5bC.oSZPGHl6hcc3rDuLEKte/vf7bew6wyi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.051	2026-10-07 11:07:16.051	\N
cmuy06k3x0055ijzekq5f3wfz	20261610046	Zalfa Utami Assya'diah	20261610046@mahasiswa.himman.local	$2b$10$/WnbjgLQggSYl8QyBmrPm.8eH2FxNMWcBz2uNCL.BmokQHcZYje4O	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.173	2026-10-07 11:07:16.173	\N
cmuy06k780059ijzeku9qhz9p	20261610047	Muhammad Alief Fadilah	20261610047@mahasiswa.himman.local	$2b$10$NU2jVUwUkSGsODKa2kxcM.Q9wISs4g8zAAixf.scduJiIwSPu5iry	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.292	2026-10-07 11:07:16.292	\N
cmuy06kaj005dijze2wu450m8	20261610048	Nazhwa Awaliah	20261610048@mahasiswa.himman.local	$2b$10$Kd2Wd5Z.U4KqILzF4dx16.e7EUPUXb4pobdmGZ9i1wScYGhxnXPMe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.412	2026-10-07 11:07:16.412	\N
cmuy06ke4005hijzez6g9a8kc	20261610049	May Khumairoh	20261610049@mahasiswa.himman.local	$2b$10$yzsIiSFd/Wm.Jj4ziNbL6erAYjQRM8mUK38DopkTKem7tet/fJr/a	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.541	2026-10-07 11:07:16.541	\N
cmuy06khg005lijze8tjvaxix	20261610050	Yuspa Pauzi Setiawan	20261610050@mahasiswa.himman.local	$2b$10$JYeuCodoLYcTVXQ3WmfS7u9YLpm0ebUT/0ruPoLS4my2p7/Kvwv1m	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.66	2026-10-07 11:07:16.66	\N
cmuy06kkz005pijzepr4wn4ok	20261610051	Nazwa Amalia Ramadhani	20261610051@mahasiswa.himman.local	$2b$10$fACM9x9OeAwj7IjCVagUrO9lXp/bne2P/iV8U1FkAd57rsec2mOm2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.787	2026-10-07 11:07:16.787	\N
cmuy06koc005tijzelvyr7n32	20261610052	Aiva Nawal Aryanti	20261610052@mahasiswa.himman.local	$2b$10$uUPJ0WdJ3s5Wq8jqPFGosuRpCcEOfAsH5eukait9ql/kCKQGv3CWW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:16.908	2026-10-07 11:07:16.908	\N
cmuy06kro005xijzef8svw0t2	20261610053	Rasyifa Syakih	20261610053@mahasiswa.himman.local	$2b$10$rq7AaGGzCG.i0YSDE/X.7eVCTOxZfAB2vMsbdLKyFvs8Z8Co7.lAG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.028	2026-10-07 11:07:17.028	\N
cmuy06kuz0061ijzew3cdmz15	20261610054	Intan Dellianti	20261610054@mahasiswa.himman.local	$2b$10$9zNFRgB7cC5/YcL7oUV6..SToOqA7DqSc.pWxzJbO0q1DzK2jD2pW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.148	2026-10-07 11:07:17.148	\N
cmuy06kyd0065ijzehtrk9vvn	20261610055	Amelia Herlinda	20261610055@mahasiswa.himman.local	$2b$10$Qfrfy6NuJm.nSCXlCejsMu51WxQPxpCPh55eD71XN9LlIPUdok/5O	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.27	2026-10-07 11:07:17.27	\N
cmuy06l1t0069ijzeutxa1a31	20261610056	Adelia Dwi Salwa	20261610056@mahasiswa.himman.local	$2b$10$dBXDs.rmuL5SBpfnNAgtGuNkTF5IFYYubjBNKk/MORNr96BQ2aaxK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.393	2026-10-07 11:07:17.393	\N
cmuy06l56006dijzeddeay14u	20261610057	Putri Sipa Safitri	20261610057@mahasiswa.himman.local	$2b$10$oRYzaxX/a/qoTTWkjeK6N.txZiFtzNxaNdiTj0dLjhfvsj27lsIfm	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.515	2026-10-07 11:07:17.515	\N
cmuy06l8o006hijze0pymhagj	20261610058	Shellyna Noor Julyka	20261610058@mahasiswa.himman.local	$2b$10$aHi6t0vQTd7HD.odIkebteD4bL4xrNzY97aJgf61.MbpHZeJ//qr2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.641	2026-10-07 11:07:17.641	\N
cmuy06lc6006lijzenmdopm2a	20261610059	De Ajril Julianda	20261610059@mahasiswa.himman.local	$2b$10$64R3vGLeO.JALb6LlDci9.C/KFwbPUYuky9R9tnXFIySouAT2wuQ2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.766	2026-10-07 11:07:17.766	\N
cmuy06lfw006pijzel00zd2ph	20261610060	Salman Abdurahman	20261610060@mahasiswa.himman.local	$2b$10$SdgMhoYdqe4wdr/mCzjC7u/Z5IFoJnhkfziP7T56yCrqgLqw95/yO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:17.9	2026-10-07 11:07:17.9	\N
cmuy06lnd006vijzen716ilsg	20261610061	Moch. Rico Satria Algibran	20261610061@mahasiswa.himman.local	$2b$10$WxUcs55YGKaD64taR4fP5OB6jL26fl/5Y3ameVvSdShyEhCMVAjFy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:18.17	2026-10-07 11:07:18.17	\N
cmuy06lr7006zijze3chfohhw	20261610062	Alexa Davina Ramadhani	20261610062@mahasiswa.himman.local	$2b$10$18nGOSW/3FJTED/dWb38KerxYHTKas2OFc5Iz.MMnPN1mAzxbTO5a	3	APPROVED	\N	\N	2026	2026-10-07 11:07:18.308	2026-10-07 11:07:18.308	\N
cmuy06lus0073ijzeyqyv0nfl	20261610063	Sayyidi Muhammad Jumadil Tsani	20261610063@mahasiswa.himman.local	$2b$10$.WysDhmCFQ3wrWnjVjax1.I6YqXbxfWhuPRSbAxLvgZCPJzb8fPb.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:18.436	2026-10-07 11:07:18.436	\N
cmuy06lya0077ijzetgyjnrog	20261610064	Dhiyanisa Chandra Nurhafidzah	20261610064@mahasiswa.himman.local	$2b$10$n63y6NFgKnxIzfiz/M4IKuMG6gTTFIJ3/wNt75JAslaEtXIOaL/Pi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:18.562	2026-10-07 11:07:18.562	\N
cmuy06m1z007bijze83bgp38w	20261610065	Meyra Dwi Khairun Nisa	20261610065@mahasiswa.himman.local	$2b$10$o7zKr55xoMwbvcS5U7llv.ktYJfjJPG6cHGXe16OcGOu5g93FuS.2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:18.695	2026-10-07 11:07:18.695	\N
cmuy06m5e007fijzeonwf06zv	20261610066	Khalista Sopyanti	20261610066@mahasiswa.himman.local	$2b$10$wIVfzQG5b1LibENPHHMuc.qq4c5CywEeJFl8uZIyTGZzQkw8DbLeO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:18.819	2026-10-07 11:07:18.819	\N
cmuy06m8t007jijze2lkdjn8f	20261610067	Earliana Mecca Maharani	20261610067@mahasiswa.himman.local	$2b$10$olgPgsELgXhZ9VDsT9Tjs.xT0FW9giFUPQpnHp.ZILNnvHsszjK92	3	APPROVED	\N	\N	2026	2026-10-07 11:07:18.941	2026-10-07 11:07:18.941	\N
cmuy06mc5007nijzejjepg4m5	20261610068	Safa Nurjanah	20261610068@mahasiswa.himman.local	$2b$10$NyGWMMGA38X9mccvM9jUZu3IHa7JajGj8ZT9f3E72LYwrjL5Qurxa	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.061	2026-10-07 11:07:19.061	\N
cmuy06mfi007rijze70bdzc7o	20261610069	Indri Arianti	20261610069@mahasiswa.himman.local	$2b$10$ORGl6xAwdDELp4mni/j02.UmcliZ9ogobGPIjPeFX1jNhuabf9PeC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.182	2026-10-07 11:07:19.182	\N
cmuy06miy007vijzea9pjo47l	20261610070	Hikmal Fajri Hakiki	20261610070@mahasiswa.himman.local	$2b$10$6zAYNROU97zKxhG9oW.VgezcjZfIodOgGC6GUAUiPUucSKhwP3Xee	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.307	2026-10-07 11:07:19.307	\N
cmuy06mmk007zijzeivp5r884	20261610071	Rajid Raditia Ramadan	20261610071@mahasiswa.himman.local	$2b$10$nVdrzE6KReJT5f0BLNAeLuJOyGFWa10YQ8E9G0nstTdq676Htcgl6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.436	2026-10-07 11:07:19.436	\N
cmuy06mq20083ijzepdvf7ldj	20261610072	Anja Perdiansyah	20261610072@mahasiswa.himman.local	$2b$10$fbNKWZzeuW0xKhuByqIKD.pJ.DpuOjDo2PUQH2LpoxPKHkBwRMrtm	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.563	2026-10-07 11:07:19.563	\N
cmuy06mtl0087ijzez5kqw1vq	20261610073	Kirani Prilian	20261610073@mahasiswa.himman.local	$2b$10$r5GKyHM0qZMrn2e7HPeGe.lE44PkXoUsEBkAB0S5xyQKXAm9DiPIC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.689	2026-10-07 11:07:19.689	\N
cmuy06mx6008bijzeg8b536ia	20261610074	Nabilla Ayu Oktavianti	20261610074@mahasiswa.himman.local	$2b$10$RPenFhXZLWR19PJihUUonOAdlXecPidXQyvpjeOuuRZ8wjed3tmXy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.819	2026-10-07 11:07:19.819	\N
cmuy06n0k008fijzefp3yf7fc	20261610075	Oktaviana Dewi	20261610075@mahasiswa.himman.local	$2b$10$TgKTmNk//2zH2sxagA5saO/AKgjmPYEP5yRQiUH3fs7tKmH3ekn.W	3	APPROVED	\N	\N	2026	2026-10-07 11:07:19.94	2026-10-07 11:07:19.94	\N
cmuy06n3t008jijzed3bgkkeq	20261610076	Dwi Syahira	20261610076@mahasiswa.himman.local	$2b$10$E8.2bl3SiGOxWb6EBKwOKOJ5pRlUYiLT/M1ndXzPt/u3IMAN0z3m6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:20.058	2026-10-07 11:07:20.058	\N
cmuy06n79008nijzektxymwra	20261610077	Annisa Maulida	20261610077@mahasiswa.himman.local	$2b$10$oksarxL/Fg5i/yrfBPDHH.1bBx8QxCaoqB9jreuEmg/W3p4sr9o0i	3	APPROVED	\N	\N	2026	2026-10-07 11:07:20.182	2026-10-07 11:07:20.182	\N
cmuy06nam008rijze7q0bnfgd	20261610078	Dewi Tantri Ramadhani	20261610078@mahasiswa.himman.local	$2b$10$8tGovPToARszzODWAzDLxuOp9wHGkLzeF6TDNS4Uc3lAbv01.qkPC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:20.303	2026-10-07 11:07:20.303	\N
cmuy06ne0008vijzefwvwavg9	20261610079	Makayla Zalvia Arla	20261610079@mahasiswa.himman.local	$2b$10$V4UZrGxCJZ/sI9gtsTSIwOpqE8/SDjnKi4iCjDCyEKwiIGoL3PcG.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:20.424	2026-10-07 11:07:20.424	\N
cmuy06nhe008zijze3n4g1n0e	20261610080	Annisa Nur Octaviani	20261610080@mahasiswa.himman.local	$2b$10$ZkoZHNyARnmhbEBxhbrqa.L9mOQc2yxx2LND3imVEXA1SMuyUng0O	3	APPROVED	\N	\N	2026	2026-10-07 11:07:20.547	2026-10-07 11:07:20.547	\N
cmuy06nqa0095ijzexzly1zob	20261610081	Ahmad Haikal Baihaqy	20261610081@mahasiswa.himman.local	$2b$10$iG0A5SAXnTl2plB2eP220OiDjcGkeJ54XTV/mmsDSUam/lXhX15VO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:20.866	2026-10-07 11:07:20.866	\N
cmuy06ntp0099ijzemxvc41m4	20261610082	Layla Noory Sebastian	20261610082@mahasiswa.himman.local	$2b$10$48r3NHldDAN7a/0b5q07ZujKwyQhcxW29DntuZTYoN2GliRLDo5ju	3	APPROVED	\N	\N	2026	2026-10-07 11:07:20.989	2026-10-07 11:07:20.989	\N
cmuy06nx1009dijzeyvn9nhvl	20261610083	Siti Fahrani Azahra	20261610083@mahasiswa.himman.local	$2b$10$8iKa0jxTxX54XUQJZ9rf8eJvJCf4YteNeEqcX1f56kPrqqMcMS8Cm	3	APPROVED	\N	\N	2026	2026-10-07 11:07:21.11	2026-10-07 11:07:21.11	\N
cmuy06o0o009hijzennxj0ggt	20261610084	Zahra Indriani	20261610084@mahasiswa.himman.local	$2b$10$QM0fQXxTePHMa0IEcLwBB.M8jFTeB1BrKHiIRbADdVHVJg0hcf5xq	3	APPROVED	\N	\N	2026	2026-10-07 11:07:21.241	2026-10-07 11:07:21.241	\N
cmuy06o43009lijzec6quqosf	20261610085	Salmaa Ledia Rayyaa Salsabil	20261610085@mahasiswa.himman.local	$2b$10$DuysO1vTDYOoDWQe2bzL2OrcWPiBNqF2YWEZLN6rrTbBPG7ReyS2q	3	APPROVED	\N	\N	2026	2026-10-07 11:07:21.363	2026-10-07 11:07:21.363	\N
cmuy06o7w009pijzej1mwtc38	20261610086	Nazwa Dyiah Putri Ratnaningsih	20261610086@mahasiswa.himman.local	$2b$10$NkbxJ1NyYxu8Be8qubhY1.jh3VusDzmn.iz753FsJqEXhC1quoNW.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:21.5	2026-10-07 11:07:21.5	\N
cmuy06obf009tijzerw3jldyh	20261610087	Ade Mulyana	20261610087@mahasiswa.himman.local	$2b$10$mQ6P7C/fU7o.aTj0flFXae/kJ4.mY1x.zY9oY/5I3aBEumU.YyVPC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:21.628	2026-10-07 11:07:21.628	\N
cmuy06oew009xijze2dntbhmd	20261610088	Raisya Kiranaya Ismail	20261610088@mahasiswa.himman.local	$2b$10$N/5o77bvSpsmPqBLYX8fj.gLyXQKU43oN6xsrxAH16yNHfrKlRkZO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:21.752	2026-10-07 11:07:21.752	\N
cmuy06oin00a1ijzeyxzau0xy	20261610089	Alma Meylani Putri	20261610089@mahasiswa.himman.local	$2b$10$YdyzYJknF1iQBY6gdRRyQuKnm96/setlMoNOIZIUZhV.GdUtAyciC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:21.887	2026-10-07 11:07:21.887	\N
cmuy06on300a5ijzej3qxi1dy	20261610090	Nailah Sobari Putri	20261610090@mahasiswa.himman.local	$2b$10$H3SgDzVZvXHRv3AzQQKhG.NL1s3M6tHf.oVSbuSll35Ls2NjHfSPG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.047	2026-10-07 11:07:22.047	\N
cmuy06oqf00a9ijze6xqo404q	20261610091	Rizkia Zahara	20261610091@mahasiswa.himman.local	$2b$10$GWaGPNea4fPiP4krVmJF7.jPZ.G.meb.4d6E2p.j6CNhSg7Z47vjW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.168	2026-10-07 11:07:22.168	\N
cmuy06otv00adijzejzctn3c7	20261610092	Nazwa Putri Kirana	20261610092@mahasiswa.himman.local	$2b$10$2J3UbiEZUyuJAS3r8L5vceHP44ZMZY/iTFJ3TI7P5qbFhjkPNLVni	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.292	2026-10-07 11:07:22.292	\N
cmuy06oxh00ahijze3rs9q8lg	20261610093	Keysa Ananda Danti	20261610093@mahasiswa.himman.local	$2b$10$2Ae1ESlKGsWRyHBICKwwjuii7AIDRhVNUnizpt.qdxPjmJIH9CCRK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.421	2026-10-07 11:07:22.421	\N
cmuy06p0u00alijze6e50xly7	20261610094	Walid Muhammad Azka	20261610094@mahasiswa.himman.local	$2b$10$YZIkqhiADKT8jNP7d7nGj.KNgLg1ZfS7K9hSn0w0NQFfVnT2id5Di	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.543	2026-10-07 11:07:22.543	\N
cmuy06p4900apijze8ci2dwdg	20261610095	Megawati	20261610095@mahasiswa.himman.local	$2b$10$LScP0zl2l76EihlD4JJcseO7uF7PBW6fkXkwes6AIQTWnA9OwgTPS	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.666	2026-10-07 11:07:22.666	\N
cmuy06p7s00atijzemmwjz4gp	20261610096	Wika Wulandari	20261610096@mahasiswa.himman.local	$2b$10$b9uTzMPcIAlK7eQONSvdjezYjXY9uxCUVA4W.Ogw2TqPFNAlatLWm	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.792	2026-10-07 11:07:22.792	\N
cmuy06pb600axijze3vopuazm	20261610097	Shyntia Kusumawardhani	20261610097@mahasiswa.himman.local	$2b$10$gKLp30tjnP/1/Tk4iOdAbuVl0D96RliW.CQRF/JlnBc9pXDJALEu2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:22.915	2026-10-07 11:07:22.915	\N
cmuy06pei00b1ijzee43k63t6	20261610098	Rafli Hakimahaflah Kabulloh	20261610098@mahasiswa.himman.local	$2b$10$18o8NiNjGE5IohbDuxPD6uxv4te8tG3triKh8BI.fu40Gxt.1iQbu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:23.035	2026-10-07 11:07:23.035	\N
cmuy06phu00b5ijzemy0fodrt	20261610099	Maeysa Maeylani	20261610099@mahasiswa.himman.local	$2b$10$yyr6FeDKgly7CNpRHvcGQ.2qzFsPGRELqfRcW6Es.2/Rf0RCpS3yW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:23.155	2026-10-07 11:07:23.155	\N
cmuy06pl800b9ijzeaoodi3ab	20261610100	Jihan Ulfah Talita S	20261610100@mahasiswa.himman.local	$2b$10$Imksj4c5ndZEIozfrfkfgul1u3ALW6RLob0k055trwP2/3696mnTe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:23.276	2026-10-07 11:07:23.276	\N
cmuy06puk00bfijze7mb1jip7	20261610101	Mustika Nuraeni	20261610101@mahasiswa.himman.local	$2b$10$hmnpi3fo6Vx8jsAtvsGe8usZXa.gBuidJQxprD/R3qWXhFd/PFplO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:23.612	2026-10-07 11:07:23.612	\N
cmuy06py200bjijzec9u2rwaa	20261610102	Salma Nursa'pina	20261610102@mahasiswa.himman.local	$2b$10$5qT705iUkiK5a4aFyl8eXey8v0UbNVaVWrPXcc4FSCfNGW.To846W	3	APPROVED	\N	\N	2026	2026-10-07 11:07:23.738	2026-10-07 11:07:23.738	\N
cmuy06q1o00bnijzexjyaacm7	20261610103	Tiara Nur Habibah	20261610103@mahasiswa.himman.local	$2b$10$yipCZ5xjof.SuJARLTAgn.ITfVF02TRoonc4cCnG3mjJ/j8UOBsTi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:23.869	2026-10-07 11:07:23.869	\N
cmuy06q4y00brijzehynia9ou	20261610104	Fitri Susilawati	20261610104@mahasiswa.himman.local	$2b$10$2dKWj5SOqhKZ7yVjX6UsuOMEZFtvRCNBIon.RuETKb62oi5.d8Dou	3	APPROVED	\N	\N	2026	2026-10-07 11:07:23.986	2026-10-07 11:07:23.986	\N
cmuy06q8c00bvijze3kdd0pa5	20261610105	Ria Risti Septiani	20261610105@mahasiswa.himman.local	$2b$10$5BqsYwpIuoDbq1sRPB29hO.fcw.CeYgbG3xHMBHa.k.Csq6QjbH5K	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.108	2026-10-07 11:07:24.108	\N
cmuy06qbr00bzijze6xz5g5jr	20261610106	Rijwan	20261610106@mahasiswa.himman.local	$2b$10$vtx9XBr3pEP/1SKr0h//0O8TZQr/G.L.m1.fp7HyQfh.OGZSuAb66	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.231	2026-10-07 11:07:24.231	\N
cmuy06qf800c3ijzepv65f19k	20261610107	Tedy Saputra	20261610107@mahasiswa.himman.local	$2b$10$lxo4yWSlfi7a950bP87jZuV1gj5VMS4XrEnMFeIRDvOMU8d4ybrcy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.356	2026-10-07 11:07:24.356	\N
cmuy06qiv00c7ijzesn7gvi12	20261610108	Muhammad Rendy Akbar Fadillah	20261610108@mahasiswa.himman.local	$2b$10$sgz9WXHlpceCP9XkEo2EqODcdhAbjmgqFrUlV82pNGHnEYzcv8GBu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.488	2026-10-07 11:07:24.488	\N
cmuy06qm800cbijzezag69ydl	20261610109	Putra Noeh Fachry	20261610109@mahasiswa.himman.local	$2b$10$LA061yHxsIIxqB.IpLhaEO4VTZUJLqxofsAxupCAIO7masA64ncMi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.608	2026-10-07 11:07:24.608	\N
cmuy06qpn00cfijzedb2czkdf	20261610110	Alif Sastradireja	20261610110@mahasiswa.himman.local	$2b$10$ALk.1OgccaY.II7DgZL8Nu/Y6Mn1RG882YUBa8raT1IMKO4ahlB1S	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.732	2026-10-07 11:07:24.732	\N
cmuy06qt600cjijzehrjkpz3w	20261610111	Riffal Putra Chandra	20261610111@mahasiswa.himman.local	$2b$10$Buq6ctXdJ7EKjjKN6Z6TS.nb8HDejC.vBY795gae3rVgwaJbjNWqW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.858	2026-10-07 11:07:24.858	\N
cmuy06qwj00cnijzevxud0ivj	20261610112	Qeisya Milan Aline Nurpijal	20261610112@mahasiswa.himman.local	$2b$10$7OXYBsecrTHoHo0IeukXeuxE2GlW/Eh5ST30jsaiJmCYlD5c3i9VC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:24.979	2026-10-07 11:07:24.979	\N
cmuy06qzx00crijzefymr0ptw	20261610113	Muhammad Salman	20261610113@mahasiswa.himman.local	$2b$10$PsUrKwNtZzxwn3qE9OvkaewBYe45ktvM0au1glA/qkDvhNdMHH4C.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.101	2026-10-07 11:07:25.101	\N
cmuy06r3a00cvijzejt9dgzaq	20261610114	Muhammad Fahri Hibbatul Azizi	20261610114@mahasiswa.himman.local	$2b$10$8K5EMS3gT7IJkRUhuM4IFeyzJ7oViaApRyxjCWABQsePMyaUPedi.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.222	2026-10-07 11:07:25.222	\N
cmuy06r6q00czijzebzdfo6ym	20261610115	Rahma Az-zahra Pratiwi	20261610115@mahasiswa.himman.local	$2b$10$t4qw60TdvqplKkxgfkrWJu.fV9KNpEVE8TtixonwSz0mvVAnh8I6C	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.346	2026-10-07 11:07:25.346	\N
cmuy06ra300d3ijze73v4vos8	20261610116	Muhammad Devara Al-kafi	20261610116@mahasiswa.himman.local	$2b$10$qJlVuTqkK25pH9FOEI1L7egnW/HgidOlSQfI8tcIU/Xh7EiIMTKRS	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.468	2026-10-07 11:07:25.468	\N
cmuy06rdf00d7ijze6d4pvaxm	20261610117	Marsha Lutviana Angel	20261610117@mahasiswa.himman.local	$2b$10$FzkJZF.WOUUwVBLfr7TuV.0sf1hi0z/HZDcu8DtkGdQrgoXyL3GOG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.587	2026-10-07 11:07:25.587	\N
cmuy06rh800dbijzeczjejh57	20261610118	Rafsan Agung Khoir	20261610118@mahasiswa.himman.local	$2b$10$NHcfMFq.480jHMdMJ9preeJ2wm9GqTLQBnz4iddd0B.SaNNn6Kl.y	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.725	2026-10-07 11:07:25.725	\N
cmuy06rko00dfijzeub1bqzr5	20261610119	Robi Otniel Tabuni	20261610119@mahasiswa.himman.local	$2b$10$5N0n4DmOnawzgg7zeN9whuLAUG/ckwOpKh03ytZ7R9n5DH3DcCp5O	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.849	2026-10-07 11:07:25.849	\N
cmuy06ro100djijzegrfwyylj	20261610120	Septian	20261610120@mahasiswa.himman.local	$2b$10$Rm4ymTAdTtAFTz3d3QrC3exiutPGGFeTi.T7YzHgs0drrPJTVL/gq	3	APPROVED	\N	\N	2026	2026-10-07 11:07:25.97	2026-10-07 11:07:25.97	\N
cmuy06rwl00dpijzege6lytd5	20261610121	Satria Prawiranagara	20261610121@mahasiswa.himman.local	$2b$10$0E9LKy4BB3uNOqBVwPVDkO.RrSSxSLJAI5RR668ltOl1vJZXUWhmi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:26.278	2026-10-07 11:07:26.278	\N
cmuy06s0100dtijzem47dup7p	20261610122	Suci Andela	20261610122@mahasiswa.himman.local	$2b$10$Dqh1qXJN/rX11p7aI6e8E.W4LOF85dxMyX3T/s/zb4hMP1RwadGjK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:26.401	2026-10-07 11:07:26.401	\N
cmuy06s3h00dxijze0hxr60zs	20261610123	Mochamad Alzhanaby Mauluddin	20261610123@mahasiswa.himman.local	$2b$10$XpAlwjX./a4TJRxL4cjz5uBtUcuuYV6G5VronAE4WmOg.LItI211.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:26.525	2026-10-07 11:07:26.525	\N
cmuy06s6w00e1ijzeqk7blje6	20261610124	Nazwa Putrianka	20261610124@mahasiswa.himman.local	$2b$10$0l5DOdhNu7JMmOBj8DOQp.E.TyPBgRHH/bp7yCiXDSm2XuEy48Ube	3	APPROVED	\N	\N	2026	2026-10-07 11:07:26.648	2026-10-07 11:07:26.648	\N
cmuy06sah00e5ijzei68cgmxm	20261610125	Mehita Salwa	20261610125@mahasiswa.himman.local	$2b$10$HhPxMnpLQNz43iWrTt1HDuqnzVtFakOh5SCBIorro8janMzrqcuBy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:26.777	2026-10-07 11:07:26.777	\N
cmuy06sdv00e9ijzef6xen1qg	20261610126	Abad Badrudin	20261610126@mahasiswa.himman.local	$2b$10$n/poZnmChf.4nfvCqnjBy.gjmSOw7fqUW4daf7QK.68g8uETifcbW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:26.9	2026-10-07 11:07:26.9	\N
cmuy06sh900edijzegapw7euo	20261610127	Abitah Natha Ferdian	20261610127@mahasiswa.himman.local	$2b$10$PcaUok2eM2dnNQO4wMTo.u1nb1YscLVAWVNM0ITSJ3aOuYeKm8MSW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.022	2026-10-07 11:07:27.022	\N
cmuy06skp00ehijze6h4e0v3o	20261610128	Nabila Aulia Azahra	20261610128@mahasiswa.himman.local	$2b$10$.KxJ8XnAmTw99vLBCRDlcO8FV/ushiCTXgwEr4yslaYXkDTHu6Sjq	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.145	2026-10-07 11:07:27.145	\N
cmuy06so200elijzeq8fsyc3q	20261610129	Nabilah Jerlina Salsabila	20261610129@mahasiswa.himman.local	$2b$10$tc5NjmxEN7ynbJAdAL9OaOEwHY4KyoIFD.YWyWeiqpggJSR2Avee.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.267	2026-10-07 11:07:27.267	\N
cmuy06sre00epijze8z1hh351	20261610130	Muhamad Raply Ismail	20261610130@mahasiswa.himman.local	$2b$10$8tqBsvjipzYDgGG8Gj4uVOil/56B5CTjzzn01Tlr1LDpvJHlGZ9ge	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.387	2026-10-07 11:07:27.387	\N
cmuy06suz00etijzeixin3eko	20261610131	Raisha Mahardhika Rahadian	20261610131@mahasiswa.himman.local	$2b$10$K2d4rlSLfyplTq8CzAOqW.QqcFFc2aniDOlW4kLV5cOLRdl6XAXsi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.515	2026-10-07 11:07:27.515	\N
cmuy06syb00exijze7vehftwx	20261610132	Ghefira Maulidina Putri	20261610132@mahasiswa.himman.local	$2b$10$fCze4iuMvTzOj0n71MJKvuNLoe5Ig223gvspO8c0o8.Sib0XdWivG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.635	2026-10-07 11:07:27.635	\N
cmuy06t1o00f1ijzey5kynmi1	20261610133	Andini Asri Rusmayanti	20261610133@mahasiswa.himman.local	$2b$10$E4zy1veUdeSEhj4BaAXm/e75fW8ZbgocRS4LdAwuZXdtFmmvtU8dS	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.757	2026-10-07 11:07:27.757	\N
cmuy06t5600f5ijzeuhj0ue3f	20261610134	Marsha Salsabilla	20261610134@mahasiswa.himman.local	$2b$10$l5UCfWDnGeJvDikByOlUSO5crA.MR5zbcNSiOfn7hvSX1eXmifypK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:27.883	2026-10-07 11:07:27.883	\N
cmuy06t8l00f9ijzevig1mrzu	20261610135	Nabiilah Nakhwah Syaakirah	20261610135@mahasiswa.himman.local	$2b$10$JIwYK.uS8oqUUzKG5Xs93uPWODh2X2QBwEumazzk533NtDoWK4yGy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:28.006	2026-10-07 11:07:28.006	\N
cmuy06tcc00fdijzenu9fmud8	20261610136	Muhamad Rizki	20261610136@mahasiswa.himman.local	$2b$10$/r6JBEKK4dY.lwIVLl6Ot.zodAYdTIikoN8eGwxm4YZX2JbhoWzq.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:28.14	2026-10-07 11:07:28.14	\N
cmuy06tfv00fhijze45fi0ss3	20261610137	Ahmad Sopyan	20261610137@mahasiswa.himman.local	$2b$10$a3JDuUK2noaTNTjQu5I5A.ENlHSRHJ5p1y0xX6wrfjTH2L4DTXZ6m	3	APPROVED	\N	\N	2026	2026-10-07 11:07:28.267	2026-10-07 11:07:28.267	\N
cmuy06tja00flijzed4pgqi7a	20261610138	Salsa Nur Azizah	20261610138@mahasiswa.himman.local	$2b$10$tNYmTVMoxPRG4E.0kOoU5uy5Y8a.ZuhSxuivGB4pW195aLftFrIRG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:28.39	2026-10-07 11:07:28.39	\N
cmuy06tms00fpijze5gzygr9h	20261610139	Rida Hasna Sofuro	20261610139@mahasiswa.himman.local	$2b$10$xJeoFM4TEcc0p0H2LMtV4Ot37lkz/h/B2B8wGvWFzeCItGkUB9wpW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:28.516	2026-10-07 11:07:28.516	\N
cmuy06tq900ftijzexrc0s2ka	20261610140	Dindha Agustin	20261610140@mahasiswa.himman.local	$2b$10$qO.vpX2/veAsQrBvsq9R.uCTPdU3JydRcaQMJI5LJXnbccyeqWzUW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:28.641	2026-10-07 11:07:28.641	\N
cmuy06txq00fzijzew1qtbxel	20261610141	Arfi Auliansyah	20261610141@mahasiswa.himman.local	$2b$10$M0umsLwPHZlHsHoTzP7xYuE0RFJ6RWw2lylZAxqd9p5OmM9yGz92a	3	APPROVED	\N	\N	2026	2026-10-07 11:07:28.91	2026-10-07 11:07:28.91	\N
cmuy06u1300g3ijzel3btvhnp	20261610142	Kawit Sapta Rangga	20261610142@mahasiswa.himman.local	$2b$10$hkBhJm1KgPa0pod7ZulKBehUZ1rPgSFrZsQcVXq.stSL/8Ppp1GTG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:29.032	2026-10-07 11:07:29.032	\N
cmuy06u6n00g7ijzen551gttk	20261610143	Amanda Nissa Gunawan	20261610143@mahasiswa.himman.local	$2b$10$IQDqh/RlV8JOLanw6BkK4.aQYaxxWR2zMx07euE3SrE7h8M5Hx5mS	3	APPROVED	\N	\N	2026	2026-10-07 11:07:29.232	2026-10-07 11:07:29.232	\N
cmuy06ub900gbijzeef9wcknp	20261610144	Amalia Nur Azizah	20261610144@mahasiswa.himman.local	$2b$10$a4RL3F.6qKkyRgHaEno2YeHA.dzt6pu57G1qNgIRSSxCgrLtlO1ja	3	APPROVED	\N	\N	2026	2026-10-07 11:07:29.397	2026-10-07 11:07:29.397	\N
cmuy06ufu00gfijzeskjan5px	20261610145	Dea Talita	20261610145@mahasiswa.himman.local	$2b$10$PXGTaqIPkvcVcc2U.KvWLOVMYUTaZf/.PQLD47c6eUM0MUdY1BbIC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:29.563	2026-10-07 11:07:29.563	\N
cmuy06ujg00gjijzewhbd24p5	20261610146	Afifah Rizkya	20261610146@mahasiswa.himman.local	$2b$10$fMRCjG.uSBZMUYlGpw9N1ueNDwrqkczG93ArHjBqzOgxgkp2P8I0i	3	APPROVED	\N	\N	2026	2026-10-07 11:07:29.693	2026-10-07 11:07:29.693	\N
cmuy06una00gnijzexlhwtbgv	20261610147	Mutia Sari	20261610147@mahasiswa.himman.local	$2b$10$6csip7V7CPQyz3dWNUlsveeRkzLlM7kgEPjgddkY4N8LsYmoYza8O	3	APPROVED	\N	\N	2026	2026-10-07 11:07:29.831	2026-10-07 11:07:29.831	\N
cmuy06usf00grijzeqkdfxqeh	20261610148	Rachma Nur Oktaviani	20261610148@mahasiswa.himman.local	$2b$10$Bk0x2gxcDy6WhbcXgnUwYOnVn8LKBx1inutv2NkYHy4SYGmqrft/C	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.015	2026-10-07 11:07:30.015	\N
cmuy06uw300gvijzevodg94j3	20261610149	Daffa Rejata Putra	20261610149@mahasiswa.himman.local	$2b$10$WlFoL6WD3GRf2.XdkK7h9OVOJoMQSDhczbTC7HLaXtlr53Ymxdszu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.148	2026-10-07 11:07:30.148	\N
cmuy06uze00gzijzetlzkw38w	20261610150	Xenia Selpidenia Kustiana Putri	20261610150@mahasiswa.himman.local	$2b$10$KZrnZxS8gReemIzapGAOWO/S5bugC8RSabfcfN38YEwKzpIuU5xwO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.266	2026-10-07 11:07:30.266	\N
cmuy06v2r00h3ijzetaruebi0	20261610151	Nabila Diniarti Ridwan	20261610151@mahasiswa.himman.local	$2b$10$8YW1MyADDTDP6.IJal6UN.JoLKT0A31s79YZqGpiOy6V4SpgQyAe.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.388	2026-10-07 11:07:30.388	\N
cmuy06v6900h7ijzenusjw8o2	20261610152	Zihan Hasna Aulia Putri	20261610152@mahasiswa.himman.local	$2b$10$0zcWJGyhRTmFgvuU87kNIuG4dePfrUMMhm.E8vzupgJvP12XjQpJi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.513	2026-10-07 11:07:30.513	\N
cmuy06v9k00hbijzer6axwk5e	20261610153	Meisya Naura Bayu	20261610153@mahasiswa.himman.local	$2b$10$7EHmUgLW8eic4Xf5i5T87ubeLzWyDAmPIg6OabzMzcX5uhoYZVnka	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.633	2026-10-07 11:07:30.633	\N
cmuy06vdm00hfijze5j8olqj3	20261610154	Rangga Paris Fauzan	20261610154@mahasiswa.himman.local	$2b$10$vHAwDvdC2AGeRFcWij5GfezCka2vzqks3G0Czg7IAoS3cMuSYX8Da	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.779	2026-10-07 11:07:30.779	\N
cmuy06vh600hjijze89q6h68y	20261610155	Zahra Kumariah	20261610155@mahasiswa.himman.local	$2b$10$966beOP.hV/eodxvM8gIkO9/tJgcpMgF27t/KnzCWk1/6vZb10zve	3	APPROVED	\N	\N	2026	2026-10-07 11:07:30.907	2026-10-07 11:07:30.907	\N
cmuy06vkr00hnijze72s8ecpj	20261610156	Karisma Eka Maharani	20261610156@mahasiswa.himman.local	$2b$10$LTNzmqjBJwA5afC1eCDmq.AqsCODgGxa8cSSIT9Uh2Fj8n2ADI7NO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:31.036	2026-10-07 11:07:31.036	\N
cmuy06vp000hrijzelejzalhs	20261610157	Muhamad Zea	20261610157@mahasiswa.himman.local	$2b$10$hNaIZOTRaBSJ5jAGoHLTX.DVYKSE3K95uYbWo2t5KcU43LbZijQUO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:31.189	2026-10-07 11:07:31.189	\N
cmuy06vsb00hvijze4dzbiuv8	20261610158	Intan Nur Agustina	20261610158@mahasiswa.himman.local	$2b$10$skfoZfFx8IaJyb5awV6BJ.nXv2RJ/0FbX35nF7Q/0QQlUEkgMCbaG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:31.308	2026-10-07 11:07:31.308	\N
cmuy06vvq00hzijzeq7mjc0wi	20261610159	Fauzan	20261610159@mahasiswa.himman.local	$2b$10$zmNsfN6vWRKx36FpnwWhQ.0XtYqpRNMYP.pUiMba3Cy9Fs8FHTllO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:31.43	2026-10-07 11:07:31.43	\N
cmuy06vz700i3ijzebz95cnfw	20261610160	Fitri Indriyanti	20261610160@mahasiswa.himman.local	$2b$10$nXQgY50wsLIvHbF5ymMsEO5f24ea4oqum75AULSPX7yL/qG.LUnZO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:31.555	2026-10-07 11:07:31.555	\N
cmuy06w6n00i9ijze3v4f49ie	20261610161	Firyal Fehima Jelyla	20261610161@mahasiswa.himman.local	$2b$10$1sUbL2Yxt6PSYRmyveKUcOWg1HeMRNujR63v1gc5GVutko1meHYvW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:31.823	2026-10-07 11:07:31.823	\N
cmuy06wa500idijze0ybcmvmb	20261610162	Ayu Febri Muthia	20261610162@mahasiswa.himman.local	$2b$10$nCQF1hCRH0uvBVXKZJJ4YuWACqCghZ9P69c8EVw3zCKAMp9k98/ES	3	APPROVED	\N	\N	2026	2026-10-07 11:07:31.95	2026-10-07 11:07:31.95	\N
cmuy06wdo00ihijzecxpbdkq1	20261610163	Zahra Salsabila	20261610163@mahasiswa.himman.local	$2b$10$v5iG7lIL3DBCFTB9h6aAveqZ68LIoZuZPnImuooUyUVqVhfIP1oZe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.076	2026-10-07 11:07:32.076	\N
cmuy06wh100ilijzedzjvmsdn	20261610164	Zenith Nur Azizah	20261610164@mahasiswa.himman.local	$2b$10$c18AsPbkbc/i1kBxJ1cD8OXk9MFfKkusWqTmuhBjBjG8hIjlZjIIa	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.198	2026-10-07 11:07:32.198	\N
cmuy06wkg00ipijzenc9obvhb	20261610165	Cemara Hawaisneni	20261610165@mahasiswa.himman.local	$2b$10$W5S8jspqomRVEPddrS9KhuOcynmhdm0etqkcvX/wwYEgCnLRBmsLC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.32	2026-10-07 11:07:32.32	\N
cmuy06wnu00itijzecca58dag	20261610166	Rahma Putri Auliya	20261610166@mahasiswa.himman.local	$2b$10$8TOiO40Lhl3Qyf/yIDkMIuzvBkhOF0q27WMoRuCwehnJcE/7FNFLe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.442	2026-10-07 11:07:32.442	\N
cmuy06wrc00ixijzea0b4uxfj	20261610167	Acep Muhammad Ibrahim	20261610167@mahasiswa.himman.local	$2b$10$aiPUwdiLyEH8DzJuRe37puKHBs5L2lrMywUxDNGJvjLrCqhJXr1Ki	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.568	2026-10-07 11:07:32.568	\N
cmuy06wuq00j1ijzezw2bdol5	20261610168	Tsaniya Ulkhaq	20261610168@mahasiswa.himman.local	$2b$10$GqRYtr72oKlqONSPlFLLoepi9/74ynxesj720LnhRVe745rZ3ZYH6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.69	2026-10-07 11:07:32.69	\N
cmuy06wyb00j5ijzebdguel49	20261610169	Nisriinaa Aurellia Raissa	20261610169@mahasiswa.himman.local	$2b$10$9HsnXFbF4dGl7qRi.t1KTe5V/tpZLxPRTgmuX3LxoI6xyY8P/ZxFK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.82	2026-10-07 11:07:32.82	\N
cmuy06x1u00j9ijzen4hd0xmv	20261610170	Sasa Fitriyani Suryaman	20261610170@mahasiswa.himman.local	$2b$10$sVFpLK7fjVzdYPsjmf9Vf.2U7ip6UoIBguRaCaQFt06TRgfk5fduu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:32.947	2026-10-07 11:07:32.947	\N
cmuy06x5b00jdijze9wrxzsee	20261610171	Doni Herdiansah	20261610171@mahasiswa.himman.local	$2b$10$MvvVxXFIwKMWC.OJpMEYd.IXc.oU1VhKrcRa0Jphx0JH.oquUfKaC	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.071	2026-10-07 11:07:33.071	\N
cmuy06x8r00jhijzeup9qad0q	20261610172	Natasya Putrindrawati	20261610172@mahasiswa.himman.local	$2b$10$lwPEeTbz4BrVRtmBPTOi3.bIebZ0wu.w2BXED9z45kNcsHYYhFfzW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.196	2026-10-07 11:07:33.196	\N
cmuy06xc500jlijzes6kmeoa2	20261610173	Nizar Nasruloh Ibrahimovic	20261610173@mahasiswa.himman.local	$2b$10$PGaq1HCLKNZsBSIqaRZ6XO/Yp4B3TUP9xc8bJzUBB2tSsevPXMkhW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.318	2026-10-07 11:07:33.318	\N
cmuy06xfq00jpijzel4b43w5m	20261610174	Saddam Abdurrahman As-sudais Hakiki	20261610174@mahasiswa.himman.local	$2b$10$57DOXhQ3dtVr8uvTr1S0v.B9.3ffH3EzSX2988AiGj9nAywrfi2Ji	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.446	2026-10-07 11:07:33.446	\N
cmuy06xj800jtijzeczibbtte	20261610175	Yupri Wenda	20261610175@mahasiswa.himman.local	$2b$10$XI2kvg74pWA8VZTMsDFh..x4YafwM0k3bLCtpr1NWFsc9YBGlSEdm	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.572	2026-10-07 11:07:33.572	\N
cmuy06xmn00jxijze0r9s8hmt	20261610176	Ziyad Malvin	20261610176@mahasiswa.himman.local	$2b$10$kiyKFQqelUxi9fvi/fILU.CRUtBQ/4XU9H5YfhMoaXfEesJTkqFp.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.696	2026-10-07 11:07:33.696	\N
cmuy06xq300k1ijzeq7nm3gcw	20261610177	Perdiansah	20261610177@mahasiswa.himman.local	$2b$10$g5n9LaCeqHKjs6QnzFF/9O/KNtLc2k9Gmy8r0jbxIRlGmzKzrsOU.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.82	2026-10-07 11:07:33.82	\N
cmuy06xth00k5ijzei7iqeh8o	20261610178	Rayhan Albani Iswansyah	20261610178@mahasiswa.himman.local	$2b$10$hNGGIDj.fJ9WLJaDOkQ0x.gKGg/Z24SFQGMRbaRrP7gbVgefI7W1i	3	APPROVED	\N	\N	2026	2026-10-07 11:07:33.942	2026-10-07 11:07:33.942	\N
cmuy06xwu00k9ijzevfbwc6m6	20261610179	Puspa Mujani	20261610179@mahasiswa.himman.local	$2b$10$f2Rt9uAn/Epf7BuIxsJhj.gVGlXn/5vg0mb.pdeo/Pwbxc1GDJ.QK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:34.062	2026-10-07 11:07:34.062	\N
cmuy06y0800kdijzeik7pa3i6	20261610180	Silvia Nur'aini	20261610180@mahasiswa.himman.local	$2b$10$jfBrzjAWbT7lGTgrdbI7wOWvZqzo9/XA2KXKvuCvQ81MNuUJUmoZ6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:34.184	2026-10-07 11:07:34.184	\N
cmuy06y7k00kjijzeztdo9h6z	20261610181	Saffa Hazel Rahman	20261610181@mahasiswa.himman.local	$2b$10$sgVAiwuF/RK71NXqjja0/.gvi9jEqsWmAB8gqCyuRCnrklZIj.73i	3	APPROVED	\N	\N	2026	2026-10-07 11:07:34.449	2026-10-07 11:07:34.449	\N
cmuy06yb700knijze4lkwvz07	20261610182	Zahra Salsabila Mubarok	20261610182@mahasiswa.himman.local	$2b$10$1Uf/VJOV45tTDxyak.6bn.x8DmWfT1FcR8RsmsC3di92W6ZHomMfS	3	APPROVED	\N	\N	2026	2026-10-07 11:07:34.579	2026-10-07 11:07:34.579	\N
cmuy06yei00krijzeqq2jh7cb	20261610183	Shiva Yohana	20261610183@mahasiswa.himman.local	$2b$10$XFgLhFBAMwNgTs1Vnt4QX.4HSHLHsaMEIJoQx3Sc4/HmbSki4hP4a	3	APPROVED	\N	\N	2026	2026-10-07 11:07:34.698	2026-10-07 11:07:34.698	\N
cmuy06yhz00kvijzeet33m9vh	20261610184	Dinie Astriyani	20261610184@mahasiswa.himman.local	$2b$10$PhHj7CTPnrr7oq0CZHMNbejlR6IYLizG0jRMCLdj0M2hBLFXgpfd6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:34.824	2026-10-07 11:07:34.824	\N
cmuy06ylb00kzijze8vx5j528	20261610185	Alya Nur Afifah	20261610185@mahasiswa.himman.local	$2b$10$WQhzgr1uJGc3G5R6sCrSTe14ZrEspbP0ifFtVQ9WY177acaK9A7Ry	3	APPROVED	\N	\N	2026	2026-10-07 11:07:34.943	2026-10-07 11:07:34.943	\N
cmuy06yop00l3ijzem7lotvle	20261610186	Safira Putri Insani	20261610186@mahasiswa.himman.local	$2b$10$i6HB2dSY.4iCotB1mgQgGOU/sjbyS8QsRThgOprlXfB3GCslyCpGa	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.066	2026-10-07 11:07:35.066	\N
cmuy06ys300l7ijzexugobcb7	20261610187	Rasya Fadillah Ahmad Sodiq	20261610187@mahasiswa.himman.local	$2b$10$xd5Ao8JW8V5p2xihUzknpeQTpfzLsDghR6/MdkYoU23DHYR4RBr6O	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.188	2026-10-07 11:07:35.188	\N
cmuy06yvh00lbijzegrckln00	20261610188	Irgi Ahmad Ardiansyah	20261610188@mahasiswa.himman.local	$2b$10$qsHNTHjclGXyCKELv3R5Jua3SwHXcBeIhO84m1UQORRLehTkKegwW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.309	2026-10-07 11:07:35.309	\N
cmuy06yyt00lfijze91dhhou1	20261610189	Heni Pariwara	20261610189@mahasiswa.himman.local	$2b$10$L/ibLGqk01BQUF7sMysbHe1sHe2aPvEcn5kUhwNFQqam8Q6z7fhEq	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.429	2026-10-07 11:07:35.429	\N
cmuy06z2800ljijzet5hnj0hn	20261610190	Reni Rahmawati	20261610190@mahasiswa.himman.local	$2b$10$2MxWCBKC/i28r4CTutUjAudNQa/YOxPhS8rUK9z7Ggw0l/KPmOP.K	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.553	2026-10-07 11:07:35.553	\N
cmuy06z5r00lnijzezqsvjdij	20261610191	Nayla Sabrina	20261610191@mahasiswa.himman.local	$2b$10$FiCVq10PdrdIDokVv5/a3OdYH0jfdaXUNmhs5Quge66j4QS7BJ.zu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.68	2026-10-07 11:07:35.68	\N
cmuy06z9p00lrijze0p9g8c22	20261610192	Rihan Nurasiah	20261610192@mahasiswa.himman.local	$2b$10$Q.G9AdqjK96MYL.Rrl7O9.W/6yvHoof.TN1vWlydL66Hlvm114Jq6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.822	2026-10-07 11:07:35.822	\N
cmuy06zd000lvijze6m8c3ib7	20261610193	Sherin Chika Saputri	20261610193@mahasiswa.himman.local	$2b$10$56e37mJYF348wYwQSsU3hOJETyOOkt.w2wkKYwa.WiSdwNElUirTO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:35.941	2026-10-07 11:07:35.941	\N
cmuy06zgc00lzijzeq4z9vm0m	20261610194	Saila Nurfaiza	20261610194@mahasiswa.himman.local	$2b$10$cu.EgBEnZtdZFGX9it1as.MAChrxS7KszyFP/5PMWeQ/cn8uzx9Iu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:36.061	2026-10-07 11:07:36.061	\N
cmuy06zjr00m3ijze6xct3g6e	20261610195	Reva Nazellina Putri Hanifah	20261610195@mahasiswa.himman.local	$2b$10$5fKoyVoaiHvuHrV8rNlfMeddMwIw9CNSTtz2aNQWtM1RfAYNc3Zda	3	APPROVED	\N	\N	2026	2026-10-07 11:07:36.184	2026-10-07 11:07:36.184	\N
cmuy06zn500m7ijzef2mg6cdw	20261610196	Azzahra Puspa Kusuma Wardhani	20261610196@mahasiswa.himman.local	$2b$10$pDArTkR7Jh.i2bFK5sBYdepq9JVprQOo7YYrNptKg4un.ailD7fQG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:36.305	2026-10-07 11:07:36.305	\N
cmuy06zqf00mbijzedjqi9s4x	20261610197	Reva Nuraeni Agustin	20261610197@mahasiswa.himman.local	$2b$10$oBpYk.z9mXDW7U8SQBLBeOzCAZO5bOBqc9tRKYcbdAMwrlX2CKqk.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:36.424	2026-10-07 11:07:36.424	\N
cmuy06zts00mfijze38l6thf3	20261610198	Chandra Maulana	20261610198@mahasiswa.himman.local	$2b$10$Rj7Ps.Oji5m3WKeiw/ciDuUPK7dTGTe3dhW9zlmVgkzCnM48e7wwK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:36.544	2026-10-07 11:07:36.544	\N
cmuy06zx500mjijzeb0hkm67y	20261610199	Salsabila	20261610199@mahasiswa.himman.local	$2b$10$2iky66YUdjvxI9nEyST/j.r6.4HLwQst8OCs68k1HbGUqZFg1p0Be	3	APPROVED	\N	\N	2026	2026-10-07 11:07:36.665	2026-10-07 11:07:36.665	\N
cmuy0700p00mnijze9lgc4mo2	20261610200	Diaztama Indra Wijaya	20261610200@mahasiswa.himman.local	$2b$10$48s22dfnXyGyx.FMrFBbZ.jUkudeaK35.v8K4i3P544.Xbc1sRxAy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:36.793	2026-10-07 11:07:36.793	\N
cmuy0707r00mtijzevcki87de	20261610201	Wikal Hafidhan	20261610201@mahasiswa.himman.local	$2b$10$aIBQDPe3tWj1HcFWVmVbwu2EHKoyDIg8CRHlhuTUu5TC6Yr03iOXq	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.047	2026-10-07 11:07:37.047	\N
cmuy070b600mxijzefuk6ajk3	20261610202	Yoga Naufall Al Baihaqi	20261610202@mahasiswa.himman.local	$2b$10$Yvaq7JjAZiNeJLxm21TwQOtpq6Ce73FkNhOssLe4yVOkE1o1b09XO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.17	2026-10-07 11:07:37.17	\N
cmuy070ek00n1ijzealmjsq4w	20261610203	Muhamad Irham Maulana Yusuf	20261610203@mahasiswa.himman.local	$2b$10$clcipSvbcQJ26KHny/ZT5.87OHkDU9UDU0g66rRQYNBvhJiQmj3Ni	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.293	2026-10-07 11:07:37.293	\N
cmuy070hw00n5ijze4ai9wy6a	20261610204	Adriel Zahroni Putra	20261610204@mahasiswa.himman.local	$2b$10$gTtEa8ZH53eykT/JaSx2iu.LapAddhWegnUQcD/e/ApS4zb1fYn3i	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.413	2026-10-07 11:07:37.413	\N
cmuy070lb00n9ijze70jberrt	20261610205	Sovi Aulia Hasanah	20261610205@mahasiswa.himman.local	$2b$10$Q0DT.PXEgwNFP2dkJeSbDu7WMQcthDqwxIYWLEcA4iAupfsj.gIcO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.535	2026-10-07 11:07:37.535	\N
cmuy070oo00ndijzeam7nesp3	20261610206	Asiyah Nur Kamilah	20261610206@mahasiswa.himman.local	$2b$10$9OrYacvN/B7CjWdLvJn6LuZcQGKdG2soFB.XI7Jl9CVBz1EaxZS2q	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.657	2026-10-07 11:07:37.657	\N
cmuy070s200nhijze2t9t38vo	20261610207	Vicka Aulia Anggreani	20261610207@mahasiswa.himman.local	$2b$10$Z.3EXMMo6XjBcrq7mPoCh.e46O1ZuCv3WtPFAO6I07cFtFj8U8VjW	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.778	2026-10-07 11:07:37.778	\N
cmuy070vk00nlijzebdwt8jql	20261610208	Alvina Faza Akmalina	20261610208@mahasiswa.himman.local	$2b$10$O6BX594DqKyzxztmfeSU8OPVLbghJQFsM1blfZJzheG.mJS2KvnM.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:37.904	2026-10-07 11:07:37.904	\N
cmuy070yv00npijzeuf73sd9m	20261610209	Elvita Nurhalida	20261610209@mahasiswa.himman.local	$2b$10$ov/pfeZdy.0EE9BcFz5R5uFLuZ5iWeHJfv/87LY768x/PhCWfRcZG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.024	2026-10-07 11:07:38.024	\N
cmuy0712800ntijze72o8jroq	20261610210	Alif Gilang Aditya	20261610210@mahasiswa.himman.local	$2b$10$cpB/xONW03B5e.wfJ/0Xpuyf.qIlcIU0jOm3Q8bj7pRoqfvXP/NVe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.145	2026-10-07 11:07:38.145	\N
cmuy0715k00nxijze8u2ly5ke	20261610211	Arianti Priscilia Br. Siagian	20261610211@mahasiswa.himman.local	$2b$10$tmPcxM9CsiwEs2zGZJz1ZumZNwoIMDp978DKH2hVVZAquaFT12vm2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.264	2026-10-07 11:07:38.264	\N
cmuy0719500o1ijze9mh101ti	20261610212	Andini	20261610212@mahasiswa.himman.local	$2b$10$G7oHUod/4weg5GGdFF8.0.wDLiI3lL4a0NtAPP5/s0Nk/2sEp7JHe	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.394	2026-10-07 11:07:38.394	\N
cmuy071ck00o5ijzee8hddp9c	20261610213	Bunga Citra Lestari	20261610213@mahasiswa.himman.local	$2b$10$qwnLeRwhv7oWkmA2dx1h4ep0DutF2IHkq1QLrjpofEurlwEhT/EYa	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.516	2026-10-07 11:07:38.516	\N
cmuy071fx00o9ijzer4lw2hj3	20261610214	Revan Agustian	20261610214@mahasiswa.himman.local	$2b$10$jcojt4D76zP8rnqHQYaRxuH4v46wC9KeU/.k43oMElnrYl.teMQmO	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.637	2026-10-07 11:07:38.637	\N
cmuy071j900odijzee6psr0zp	20261610215	Muhammad Syauqi Mustaqim	20261610215@mahasiswa.himman.local	$2b$10$VcAdCa9zWlojAOS3T5f3GusOTgHk2QRB28/.ZcbY0I7KdHf5osZ6.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.758	2026-10-07 11:07:38.758	\N
cmuy071mp00ohijzelof2s519	20261610216	Zakirien Ghassani Qolbi	20261610216@mahasiswa.himman.local	$2b$10$jniY96BynMF48.8C6ekgK.VaraBQ/7v7HeYiP5HmMdZZ/Sc.b.dEi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:38.882	2026-10-07 11:07:38.882	\N
cmuy071q300olijze3vgoyrhp	20261610217	Revalina Nur'aeni	20261610217@mahasiswa.himman.local	$2b$10$KRKAh2ETMBRn/HO1TcEc3utlMzFYtzycup7uC0h00Xx66vYPs/mWu	3	APPROVED	\N	\N	2026	2026-10-07 11:07:39.003	2026-10-07 11:07:39.003	\N
cmuy071tn00opijze3dut94nr	20261610218	Fajar Rafiansyah	20261610218@mahasiswa.himman.local	$2b$10$owvMg4uTwBzKMIigbVOusON.hvC/GxwQhvcCa4AqC17tldZuv7Zoi	3	APPROVED	\N	\N	2026	2026-10-07 11:07:39.131	2026-10-07 11:07:39.131	\N
cmuy071x100otijzel2cblwz3	20261610219	Yazid Akbar Rostiana	20261610219@mahasiswa.himman.local	$2b$10$VDHDRM08TZgXNkKrZ8Hav.azP9aP8apB2V.tYlAufolPNp/MeU.p.	3	APPROVED	\N	\N	2026	2026-10-07 11:07:39.253	2026-10-07 11:07:39.253	\N
cmuy0720e00oxijze34adfphw	20261610220	Matahari Ismail Arsa Jiwa	20261610220@mahasiswa.himman.local	$2b$10$7aGqgGGUqqlv5ZjbphNh2e8o6qhD7c6waJQjip4Rks9sirmkh.rYG	3	APPROVED	\N	\N	2026	2026-10-07 11:07:39.374	2026-10-07 11:07:39.374	\N
cmuy0729200p3ijze8lgm6zrr	20261610221	Siti Nurrahma	20261610221@mahasiswa.himman.local	$2b$10$hYkN5a5OEfe6KDQ7N2qIpOnwJAB2iijd8XzOZh1jVAOcj/ZCn4xCy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:39.686	2026-10-07 11:07:39.686	\N
cmuy072ch00p7ijzen8iqf27v	20261610222	Muhamad Rahman Priadi	20261610222@mahasiswa.himman.local	$2b$10$0BtiMLKIihrwQgP./dCE8.y1SVLzPhm3jr7xtU8lgC2gkhx9zeS9y	3	APPROVED	\N	\N	2026	2026-10-07 11:07:39.81	2026-10-07 11:07:39.81	\N
cmuy072g000pbijzeveo0bx4b	20261610223	Haifa Assyifa Mazaya	20261610223@mahasiswa.himman.local	$2b$10$J.m8Tc5NHjQkNHGwsEiw..5cYgP00pB1T9JAKs0FwGtvUNmN9yu4O	3	APPROVED	\N	\N	2026	2026-10-07 11:07:39.937	2026-10-07 11:07:39.937	\N
cmuy072jc00pfijzev4lell37	20261610224	Arif Rohimat	20261610224@mahasiswa.himman.local	$2b$10$GOiCWI6CR3nwGrNhx8PgJenj5dFKhxon3VAyY6DPAvoXldtUAttfy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.056	2026-10-07 11:07:40.056	\N
cmuy072mo00pjijzehr4sxy1j	20261610225	Tiara Alifia	20261610225@mahasiswa.himman.local	$2b$10$uFtaw/lhVtD.Dw0Z8a7LwuNuskq8aoQT.KC0JrQakgBS/UdQuOICK	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.176	2026-10-07 11:07:40.176	\N
cmuy072q700pnijze0crfwiiy	20261610226	Riki Sukma	20261610226@mahasiswa.himman.local	$2b$10$ASswkBWZtdDgNqRTNOOX8eYml5vtyivayqzYsNcbqlfgnBKi/hbm6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.303	2026-10-07 11:07:40.303	\N
cmuy072tk00prijzewk4ptnih	20261610227	Melia Rahma Nurfadila	20261610227@mahasiswa.himman.local	$2b$10$06YBaXF9NWoH3Tvf8IA4WOjsm8VkmzDv5ctTk0TAPivKsiFbUV6Uq	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.424	2026-10-07 11:07:40.424	\N
cmuy072wz00pvijzeb3pz8z27	20261610228	Muhammad Haris Fauzan	20261610228@mahasiswa.himman.local	$2b$10$d08rwWDd/TpfEAtplYr0G.Y2R7VQ5..GMrkwQMAvAlOrjM5AxexkS	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.548	2026-10-07 11:07:40.548	\N
cmuy0730c00pzijzed0iu13wz	20261610229	Shofa Surya Rahayu	20261610229@mahasiswa.himman.local	$2b$10$PGl7cZyU72iKe/vHrF3rG.V8Tf/uhbY93k606uUZggrd6YJf8O88S	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.668	2026-10-07 11:07:40.668	\N
cmuy0734700q3ijzefds7pgn2	20261610230	Nazwa Widia Sabila	20261610230@mahasiswa.himman.local	$2b$10$I2DCdanXlWpBXQtgXtfL/uveUDZz7nur8GFOCmW5L2qYSuX.RIC8y	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.807	2026-10-07 11:07:40.807	\N
cmuy0737l00q7ijze5vqxr793	20261610231	Fahmi Hambali Gunawan	20261610231@mahasiswa.himman.local	$2b$10$RlHu4AjkIWR1RssaxcAarO/02M1fQQr4w0Ywfjx.75S3dxBOWxLQ2	3	APPROVED	\N	\N	2026	2026-10-07 11:07:40.929	2026-10-07 11:07:40.929	\N
cmuy073ay00qbijzez9crfuvt	20261610232	Arka Denra Hidayah	20261610232@mahasiswa.himman.local	$2b$10$asgqMsbrAK4adsgp89Otku9EKyZQ5TMF7ppCfNSPYHAghtOiWou9y	3	APPROVED	\N	\N	2026	2026-10-07 11:07:41.051	2026-10-07 11:07:41.051	\N
cmuy073ec00qfijzeeldlav9e	20261610233	Rizki Mohamad Alif	20261610233@mahasiswa.himman.local	$2b$10$iIMFzSZiV7pggYIdvyJC0euezMdwnRfT0cEmFHFEweBLZJAlY.AGy	3	APPROVED	\N	\N	2026	2026-10-07 11:07:41.172	2026-10-07 11:07:41.172	\N
cmuy073ho00qjijzeh1iv85sm	20261610234	Citra Lestari	20261610234@mahasiswa.himman.local	$2b$10$lWE5VyBhOUwtd1GyzYpap.ZsGXsJdZnHJfE9gTG7oa5OEx.LyM0f6	3	APPROVED	\N	\N	2026	2026-10-07 11:07:41.293	2026-10-07 11:07:41.293	\N
cmuy073l100qnijzes4iw3l7h	20261610235	Jaenal Sidik	20261610235@mahasiswa.himman.local	$2b$10$R/z.B53q4vkm6rPCTyRqhu73kUeLAkERGpNQwCMXcgotCmbzyI2li	3	APPROVED	\N	\N	2026	2026-10-07 11:07:41.413	2026-10-07 11:07:41.413	\N
cmuxj1jr2000gijpr9z5eongf	20251610204	Ubadurahman Nurdzaky	test@gmail.com	$2b$12$tCAo8at/UP5QqPN761b1P.LI6CRZJolhqUaNdrlz/lrs25hd3ykvO	2	APPROVED	\N	\N	2025	2026-10-07 03:07:28.958	2026-10-13 04:26:14.01	/api/signatures/7700a33b-df8e-4272-b4a1-4d5eeae1aee1.png
\.


--
-- Name: committee_divisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.committee_divisions_id_seq', 3, true);


--
-- Name: divisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.divisions_id_seq', 8, true);


--
-- Name: org_officers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.org_officers_id_seq', 7, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 6, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: cms_posts cms_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_posts
    ADD CONSTRAINT cms_posts_pkey PRIMARY KEY (id);


--
-- Name: committee_applications committee_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_applications
    ADD CONSTRAINT committee_applications_pkey PRIMARY KEY (id);


--
-- Name: committee_divisions committee_divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_divisions
    ADD CONSTRAINT committee_divisions_pkey PRIMARY KEY (id);


--
-- Name: committee_meeting_attendances committee_meeting_attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_meeting_attendances
    ADD CONSTRAINT committee_meeting_attendances_pkey PRIMARY KEY (id);


--
-- Name: committee_meetings committee_meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_meetings
    ADD CONSTRAINT committee_meetings_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: letter_counters letter_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_counters
    ADD CONSTRAINT letter_counters_pkey PRIMARY KEY (year, type);


--
-- Name: member_dues member_dues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_dues
    ADD CONSTRAINT member_dues_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: official_letters official_letters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.official_letters
    ADD CONSTRAINT official_letters_pkey PRIMARY KEY (id);


--
-- Name: org_officers org_officers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_officers
    ADD CONSTRAINT org_officers_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (key);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY ("roleId", "permissionId");


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY ("userId", "permissionId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX accounts_code_key ON public.accounts USING btree (code);


--
-- Name: certificates_certificate_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX certificates_certificate_number_key ON public.certificates USING btree (certificate_number);


--
-- Name: certificates_event_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX certificates_event_id_user_id_key ON public.certificates USING btree (event_id, user_id);


--
-- Name: cms_posts_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_posts_slug_key ON public.cms_posts USING btree (slug);


--
-- Name: committee_applications_event_id_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX committee_applications_event_id_status_idx ON public.committee_applications USING btree (event_id, status);


--
-- Name: committee_applications_event_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX committee_applications_event_id_user_id_key ON public.committee_applications USING btree (event_id, user_id);


--
-- Name: committee_applications_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX committee_applications_user_id_idx ON public.committee_applications USING btree (user_id);


--
-- Name: committee_divisions_event_id_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX committee_divisions_event_id_name_key ON public.committee_divisions USING btree (event_id, name);


--
-- Name: committee_meeting_attendances_meeting_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX committee_meeting_attendances_meeting_id_user_id_key ON public.committee_meeting_attendances USING btree (meeting_id, user_id);


--
-- Name: committee_meeting_attendances_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX committee_meeting_attendances_user_id_idx ON public.committee_meeting_attendances USING btree (user_id);


--
-- Name: committee_meetings_event_id_starts_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX committee_meetings_event_id_starts_at_idx ON public.committee_meetings USING btree (event_id, starts_at);


--
-- Name: divisions_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX divisions_name_key ON public.divisions USING btree (name);


--
-- Name: event_registrations_event_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX event_registrations_event_id_user_id_key ON public.event_registrations USING btree (event_id, user_id);


--
-- Name: event_registrations_qr_code_hash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX event_registrations_qr_code_hash_key ON public.event_registrations USING btree (qr_code_hash);


--
-- Name: events_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX events_slug_key ON public.events USING btree (slug);


--
-- Name: feedbacks_status_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX feedbacks_status_created_at_idx ON public.feedbacks USING btree (status, created_at);


--
-- Name: feedbacks_tracking_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX feedbacks_tracking_code_key ON public.feedbacks USING btree (tracking_code);


--
-- Name: financial_transactions_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX financial_transactions_date_idx ON public.financial_transactions USING btree (date);


--
-- Name: journal_lines_account_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_lines_account_id_idx ON public.journal_lines USING btree (account_id);


--
-- Name: journal_lines_transaction_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_lines_transaction_id_idx ON public.journal_lines USING btree (transaction_id);


--
-- Name: member_dues_user_id_month_year_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX member_dues_user_id_month_year_key ON public.member_dues USING btree (user_id, month_year);


--
-- Name: members_kta_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX members_kta_number_key ON public.members USING btree (kta_number);


--
-- Name: members_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX members_user_id_key ON public.members USING btree (user_id);


--
-- Name: official_letters_event_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX official_letters_event_id_idx ON public.official_letters USING btree (event_id);


--
-- Name: official_letters_letter_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX official_letters_letter_date_idx ON public.official_letters USING btree (letter_date);


--
-- Name: official_letters_letter_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX official_letters_letter_number_key ON public.official_letters USING btree (letter_number);


--
-- Name: org_officers_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX org_officers_position_idx ON public.org_officers USING btree ("position");


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: resources_category_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resources_category_created_at_idx ON public.resources USING btree (category, created_at);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_nim_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_nim_key ON public.users USING btree (nim);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: certificates certificates_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certificates certificates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cms_posts cms_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_posts
    ADD CONSTRAINT cms_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: committee_applications committee_applications_assigned_division_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_applications
    ADD CONSTRAINT committee_applications_assigned_division_id_fkey FOREIGN KEY (assigned_division_id) REFERENCES public.committee_divisions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: committee_applications committee_applications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_applications
    ADD CONSTRAINT committee_applications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_applications committee_applications_first_choice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_applications
    ADD CONSTRAINT committee_applications_first_choice_id_fkey FOREIGN KEY (first_choice_id) REFERENCES public.committee_divisions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: committee_applications committee_applications_second_choice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_applications
    ADD CONSTRAINT committee_applications_second_choice_id_fkey FOREIGN KEY (second_choice_id) REFERENCES public.committee_divisions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: committee_applications committee_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_applications
    ADD CONSTRAINT committee_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_divisions committee_divisions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_divisions
    ADD CONSTRAINT committee_divisions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_meeting_attendances committee_meeting_attendances_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_meeting_attendances
    ADD CONSTRAINT committee_meeting_attendances_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.committee_meetings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_meeting_attendances committee_meeting_attendances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_meeting_attendances
    ADD CONSTRAINT committee_meeting_attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_meetings committee_meetings_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.committee_meetings
    ADD CONSTRAINT committee_meetings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_registrations event_registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_registrations event_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: feedbacks feedbacks_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_lines journal_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_lines journal_lines_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.financial_transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_dues member_dues_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_dues
    ADD CONSTRAINT member_dues_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.financial_transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: member_dues member_dues_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_dues
    ADD CONSTRAINT member_dues_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: members members_division_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: members members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: official_letters official_letters_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.official_letters
    ADD CONSTRAINT official_letters_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: org_officers org_officers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_officers
    ADD CONSTRAINT org_officers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: resources resources_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 0Ob6ROs9QYipxzgU2izK4iGaKMvhhTvYoiDz2cFlVdc29cc9A4YVOSz11VwSwlm

