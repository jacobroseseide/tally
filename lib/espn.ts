export interface Game {
    id: string
    homeTeam: string
    awayTeam: string
    homeTeamLogo?: string
    awayTeamLogo?: string
    gameDate: string
    league: string
    status: string
  }
  
  // Minimal types for the parts of the ESPN response we use
  type EspnTeam = {
    displayName: string
    logo?: string
  }
  
  type EspnCompetitor = {
    homeAway: 'home' | 'away'
    team: EspnTeam
  }
  
  type EspnCompetition = {
    competitors: EspnCompetitor[]
  }
  
  type EspnEvent = {
    id: string
    date: string
    status?: {
      type?: {
        name?: string
      }
    }
    competitions?: EspnCompetition[]
  }
  
  export async function getUpcomingGames(league: 'nba' | 'nfl' | 'mlb' = 'nba'): Promise<Game[]> {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${
          league === 'nba' ? 'basketball/nba' :
          league === 'nfl' ? 'football/nfl' :
          'baseball/mlb'
        }/scoreboard`
      )
  
      if (!response.ok) throw new Error('Failed to fetch games')
  
      const data = await response.json()
  
      const events: EspnEvent[] = Array.isArray(data.events) ? data.events : []
  
      const games: Game[] = events.map((event) => {
        const competition = event.competitions?.[0]
        const home = competition?.competitors.find((c) => c.homeAway === 'home')
        const away = competition?.competitors.find((c) => c.homeAway === 'away')
  
        return {
          id: event.id,
          homeTeam: home?.team.displayName ?? 'TBD',
          awayTeam: away?.team.displayName ?? 'TBD',
          homeTeamLogo: home?.team.logo,
          awayTeamLogo: away?.team.logo,
          gameDate: event.date,
          league: league.toUpperCase(),
          status: event.status?.type?.name ?? 'unknown',
        }
      })
  
      return games
    } catch (error) {
      console.error('Error fetching games:', error)
      return []
    }
  }