import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {GetStaticPaths, GetStaticProps} from 'next';

import {ptBR} from 'date-fns/locale';
import {format, parseISO} from 'date-fns';

import {api} from '../../services/api';
import {usePlayer} from '../../contexts/PlayerContext';
import {convertDurationToTimeString} from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';

type Episode = {
    id: string;
    title: string;
    members: string;
    publishedAt: string;
    thumbnail: string;
    duration: number;
    durationAsString: string;
    url: string;
    description: string;
};
type EpisodeProps = {
    episode: Episode;
};

export default function Episode({episode}: EpisodeProps) {
    const {play} = usePlayer();
    const router = useRouter();

    if (router.isFallback) {
        return <p>Carregando...</p>;
    }

    return (
        <div className={styles.episode}>
            <Head>{episode.title} | Podcastr</Head>

            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>

                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />

                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div
                className={styles.description}
                dangerouslySetInnerHTML={{__html: episode.description}}
            />
        </div>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
    const {slug} = ctx.params;
    const {data} = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        duration: Number(data.file.duration),
        description: data.description,
        url: data.file.url,
        durationAsString: convertDurationToTimeString(
            Number(data.file.duration),
        ),
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
            locale: ptBR,
        }),
    };

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, // 24 hours
    };
};
