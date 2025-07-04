PGDMP  -    6                }        	   snowledge    16.9 (Debian 16.9-1.pgdg120+1)    16.9 (Homebrew) 5    j           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            k           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            l           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            m           1262    16384 	   snowledge    DATABASE     t   CREATE DATABASE snowledge WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE snowledge;
                postgres    false            T           1247    16399    email_emailtype_enum    TYPE     =   CREATE TYPE public.email_emailtype_enum AS ENUM (
    '0'
);
 '   DROP TYPE public.email_emailtype_enum;
       public          postgres    false            c           1247    18737    learner_status_enum    TYPE     ^   CREATE TYPE public.learner_status_enum AS ENUM (
    'invited',
    'member',
    'banned'
);
 &   DROP TYPE public.learner_status_enum;
       public          postgres    false            Z           1247    16415    user_gender_enum    TYPE     B   CREATE TYPE public.user_gender_enum AS ENUM (
    '0',
    '1'
);
 #   DROP TYPE public.user_gender_enum;
       public          postgres    false            �            1259    16390 	   community    TABLE     �  CREATE TABLE public.community (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "userId" integer NOT NULL,
    slug character varying NOT NULL,
    tags json NOT NULL,
    "communityType" character varying NOT NULL,
    description character varying NOT NULL,
    "codeOfConduct" character varying NOT NULL,
    price double precision,
    "yourPercentage" double precision,
    "communityPercentage" double precision,
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL
);
    DROP TABLE public.community;
       public         heap    postgres    false            �            1259    16389    community_id_seq    SEQUENCE     �   CREATE SEQUENCE public.community_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.community_id_seq;
       public          postgres    false    216            n           0    0    community_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.community_id_seq OWNED BY public.community.id;
          public          postgres    false    215            �            1259    18610    discord_access    TABLE     �  CREATE TABLE public.discord_access (
    id integer NOT NULL,
    "accessToken" character varying NOT NULL,
    "tokenType" character varying NOT NULL,
    "expiresIn" integer NOT NULL,
    "refreshToken" character varying NOT NULL,
    scope character varying NOT NULL,
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL
);
 "   DROP TABLE public.discord_access;
       public         heap    postgres    false            �            1259    18609    discord_access_id_seq    SEQUENCE     �   CREATE SEQUENCE public.discord_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.discord_access_id_seq;
       public          postgres    false    222            o           0    0    discord_access_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.discord_access_id_seq OWNED BY public.discord_access.id;
          public          postgres    false    221            �            1259    16402    email    TABLE     �  CREATE TABLE public.email (
    id integer NOT NULL,
    "emailType" public.email_emailtype_enum DEFAULT '0'::public.email_emailtype_enum NOT NULL,
    email character varying NOT NULL,
    code integer,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    "userId" integer
);
    DROP TABLE public.email;
       public         heap    postgres    false    852    852            �            1259    16401    email_id_seq    SEQUENCE     �   CREATE SEQUENCE public.email_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.email_id_seq;
       public          postgres    false    218            p           0    0    email_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.email_id_seq OWNED BY public.email.id;
          public          postgres    false    217            �            1259    18688    learner    TABLE     �  CREATE TABLE public.learner (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    "userId" integer,
    "communityId" integer,
    "isContributor" boolean DEFAULT false NOT NULL,
    "invitedAt" timestamp without time zone,
    status public.learner_status_enum DEFAULT 'member'::public.learner_status_enum NOT NULL
);
    DROP TABLE public.learner;
       public         heap    postgres    false    867    867            �            1259    18687    learner_id_seq    SEQUENCE     �   CREATE SEQUENCE public.learner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.learner_id_seq;
       public          postgres    false    224            q           0    0    learner_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.learner_id_seq OWNED BY public.learner.id;
          public          postgres    false    223            �            1259    16420    user    TABLE     &  CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    pseudo character varying NOT NULL,
    gender public.user_gender_enum NOT NULL,
    password character varying NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    referrer character varying,
    referral character varying NOT NULL,
    created_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    updated_at timestamp without time zone DEFAULT ('now'::text)::timestamp(6) with time zone NOT NULL,
    "discordId" character varying,
    "youtubeId" character varying,
    "refreshToken" character varying,
    "discordAccessId" integer,
    age timestamp without time zone NOT NULL
);
    DROP TABLE public."user";
       public         heap    postgres    false    858            �            1259    16419    user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.user_id_seq;
       public          postgres    false    220            r           0    0    user_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;
          public          postgres    false    219            �           2604    16393    community id    DEFAULT     l   ALTER TABLE ONLY public.community ALTER COLUMN id SET DEFAULT nextval('public.community_id_seq'::regclass);
 ;   ALTER TABLE public.community ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    216    216            �           2604    18613    discord_access id    DEFAULT     v   ALTER TABLE ONLY public.discord_access ALTER COLUMN id SET DEFAULT nextval('public.discord_access_id_seq'::regclass);
 @   ALTER TABLE public.discord_access ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    221    222            �           2604    16405    email id    DEFAULT     d   ALTER TABLE ONLY public.email ALTER COLUMN id SET DEFAULT nextval('public.email_id_seq'::regclass);
 7   ALTER TABLE public.email ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    217    218            �           2604    18691 
   learner id    DEFAULT     h   ALTER TABLE ONLY public.learner ALTER COLUMN id SET DEFAULT nextval('public.learner_id_seq'::regclass);
 9   ALTER TABLE public.learner ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    223    224    224            �           2604    16423    user id    DEFAULT     d   ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);
 8   ALTER TABLE public."user" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    220    220            _          0    16390 	   community 
   TABLE DATA           �   COPY public.community (id, name, "userId", slug, tags, "communityType", description, "codeOfConduct", price, "yourPercentage", "communityPercentage", created_at, updated_at) FROM stdin;
    public          postgres    false    216   
G       e          0    18610    discord_access 
   TABLE DATA           �   COPY public.discord_access (id, "accessToken", "tokenType", "expiresIn", "refreshToken", scope, created_at, updated_at) FROM stdin;
    public          postgres    false    222   VH       a          0    16402    email 
   TABLE DATA           e   COPY public.email (id, "emailType", email, code, used, created_at, updated_at, "userId") FROM stdin;
    public          postgres    false    218   I       g          0    18688    learner 
   TABLE DATA           |   COPY public.learner (id, created_at, updated_at, "userId", "communityId", "isContributor", "invitedAt", status) FROM stdin;
    public          postgres    false    224   "I       c          0    16420    user 
   TABLE DATA           �   COPY public."user" (id, email, firstname, lastname, pseudo, gender, password, "isActive", referrer, referral, created_at, updated_at, "discordId", "youtubeId", "refreshToken", "discordAccessId", age) FROM stdin;
    public          postgres    false    220   �I       s           0    0    community_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.community_id_seq', 50, true);
          public          postgres    false    215            t           0    0    discord_access_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.discord_access_id_seq', 1, true);
          public          postgres    false    221            u           0    0    email_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.email_id_seq', 1, false);
          public          postgres    false    217            v           0    0    learner_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.learner_id_seq', 19, true);
          public          postgres    false    223            w           0    0    user_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.user_id_seq', 13, true);
          public          postgres    false    219            �           2606    16413 $   email PK_1e7ed8734ee054ef18002e29b1c 
   CONSTRAINT     d   ALTER TABLE ONLY public.email
    ADD CONSTRAINT "PK_1e7ed8734ee054ef18002e29b1c" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.email DROP CONSTRAINT "PK_1e7ed8734ee054ef18002e29b1c";
       public            postgres    false    218            �           2606    18619 -   discord_access PK_525231add651f1a7598f4a7044d 
   CONSTRAINT     m   ALTER TABLE ONLY public.discord_access
    ADD CONSTRAINT "PK_525231add651f1a7598f4a7044d" PRIMARY KEY (id);
 Y   ALTER TABLE ONLY public.discord_access DROP CONSTRAINT "PK_525231add651f1a7598f4a7044d";
       public            postgres    false    222            �           2606    18698 &   learner PK_c6521028f8bb5e7ab25067f8f4d 
   CONSTRAINT     f   ALTER TABLE ONLY public.learner
    ADD CONSTRAINT "PK_c6521028f8bb5e7ab25067f8f4d" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.learner DROP CONSTRAINT "PK_c6521028f8bb5e7ab25067f8f4d";
       public            postgres    false    224            �           2606    16430 #   user PK_cace4a159ff9f2512dd42373760 
   CONSTRAINT     e   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760";
       public            postgres    false    220            �           2606    16397 (   community PK_cae794115a383328e8923de4193 
   CONSTRAINT     h   ALTER TABLE ONLY public.community
    ADD CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.community DROP CONSTRAINT "PK_cae794115a383328e8923de4193";
       public            postgres    false    216            �           2606    16434 #   user UQ_004fa929e8fcb51a72b38f1def9 
   CONSTRAINT     f   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_004fa929e8fcb51a72b38f1def9" UNIQUE (referral);
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "UQ_004fa929e8fcb51a72b38f1def9";
       public            postgres    false    220            �           2606    18621 #   user UQ_13af5754f14d8d255fd9b3ee5c7 
   CONSTRAINT     i   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_13af5754f14d8d255fd9b3ee5c7" UNIQUE ("discordId");
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "UQ_13af5754f14d8d255fd9b3ee5c7";
       public            postgres    false    220            �           2606    16446 (   community UQ_198f18552bc2c404cc62bf3b6f6 
   CONSTRAINT     e   ALTER TABLE ONLY public.community
    ADD CONSTRAINT "UQ_198f18552bc2c404cc62bf3b6f6" UNIQUE (slug);
 T   ALTER TABLE ONLY public.community DROP CONSTRAINT "UQ_198f18552bc2c404cc62bf3b6f6";
       public            postgres    false    216            �           2606    18623 #   user UQ_527101032d74b23de811001001c 
   CONSTRAINT     i   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_527101032d74b23de811001001c" UNIQUE ("youtubeId");
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "UQ_527101032d74b23de811001001c";
       public            postgres    false    220            �           2606    18625 #   user UQ_a19399f1540bd37af8f6ab35e72 
   CONSTRAINT     o   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_a19399f1540bd37af8f6ab35e72" UNIQUE ("discordAccessId");
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "UQ_a19399f1540bd37af8f6ab35e72";
       public            postgres    false    220            �           2606    16432 #   user UQ_e12875dfb3b1d92d7d7c5377e22 
   CONSTRAINT     c   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22";
       public            postgres    false    220            �           2606    16435 $   email FK_13e97b4a1d6074fd75ea1bb844e    FK CONSTRAINT     �   ALTER TABLE ONLY public.email
    ADD CONSTRAINT "FK_13e97b4a1d6074fd75ea1bb844e" FOREIGN KEY ("userId") REFERENCES public."user"(id);
 P   ALTER TABLE ONLY public.email DROP CONSTRAINT "FK_13e97b4a1d6074fd75ea1bb844e";
       public          postgres    false    218    220    3259            �           2606    16440 (   community FK_38d243246340bda9905ff8fd1e0    FK CONSTRAINT     �   ALTER TABLE ONLY public.community
    ADD CONSTRAINT "FK_38d243246340bda9905ff8fd1e0" FOREIGN KEY ("userId") REFERENCES public."user"(id);
 T   ALTER TABLE ONLY public.community DROP CONSTRAINT "FK_38d243246340bda9905ff8fd1e0";
       public          postgres    false    220    3259    216            �           2606    18701 &   learner FK_7a8c7e8af1a915f349f0c656b58    FK CONSTRAINT     �   ALTER TABLE ONLY public.learner
    ADD CONSTRAINT "FK_7a8c7e8af1a915f349f0c656b58" FOREIGN KEY ("userId") REFERENCES public."user"(id);
 R   ALTER TABLE ONLY public.learner DROP CONSTRAINT "FK_7a8c7e8af1a915f349f0c656b58";
       public          postgres    false    220    3259    224            �           2606    18681 #   user FK_a19399f1540bd37af8f6ab35e72    FK CONSTRAINT     �   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_a19399f1540bd37af8f6ab35e72" FOREIGN KEY ("discordAccessId") REFERENCES public.discord_access(id);
 Q   ALTER TABLE ONLY public."user" DROP CONSTRAINT "FK_a19399f1540bd37af8f6ab35e72";
       public          postgres    false    220    3271    222            �           2606    18706 &   learner FK_cc0e995546fa0e0c997cead8b12    FK CONSTRAINT     �   ALTER TABLE ONLY public.learner
    ADD CONSTRAINT "FK_cc0e995546fa0e0c997cead8b12" FOREIGN KEY ("communityId") REFERENCES public.community(id);
 R   ALTER TABLE ONLY public.learner DROP CONSTRAINT "FK_cc0e995546fa0e0c997cead8b12";
       public          postgres    false    216    224    3253            _   <  x���?O�0���2S��q�+�Z����J��sN[@%��)���$��.*��)��<wǗ���x��[$@�{��%�Y
�Tn!*�ōS��3CC=%�)�0���H���le�
�N�r����=��B��,D{e9Z#g$�>.E���)O�2r\�ಒV��aE;��;gn��5*�Qp�J��$�n��57��+v�����&E$�d�kg��f$f�	����tSˁ��ȕ������C���z� Vb&imۦ��$���)�\P&J=#1԰J���TܽևFstX	���r��/���      e   �   x�}�Q
�0 �����2�fꣅ�Q�%���W��3�N��^?���1��y��A�X��������% '�P@yH)��-Z�|�g�^�tWn�+��}�t�A�[��%0HՓ�h����d ke֝@6D5�gծ�Q&*ϏES���)�p1�?��5      a      x������ � �      g   �   x���1�0���9hd;q�,L� u(B��J��i��~}�#F�e`;a.B���!�ޤ�~µ��N��p�0X�I�7��)^����^��roR���"�x��zu�����8�&;��V~w��<a��ι7ia      c   �  x���K��0���Sx�j̃ണ[�2����N�%B�EQ�~��ұ��4��ʡ��T���˽X����|C���\�(��z	��*pO�)�Σ8� ���0�I��Oz�>g�~G�nnz�Fʩٰ��j<�޼d��kF���!�����>�zhPC@au��Ĩbj1biR��M0�Ȱ�r
uQ���ώ/YZ��*!B�+����$�i*�l�)
l���y�'��Q�k��~O��^2��t�s�<{K�ٮS\�v1xC9�a��v�g�Hrl|�ִ��E���da"F�Io�OW��� ���g�N�s���_�������x�I�rv�ks��9v&��5q�daGr�9cI����tU�3L��%� �Dՠ��/�2��n�ø��ns(:b،rȊ� �Q�Hi����}:*&�9kӖ6�u��1�u�q,K?��������1��n15j��K����V��㼗ԥn�eY T�;���+��R
�     